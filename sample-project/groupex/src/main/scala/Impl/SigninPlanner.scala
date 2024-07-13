package Impl

import cats.effect.IO
import io.circe.generic.auto.*
import Common.API.{PlanContext, Planner}
import Common.DBAPI.*
import Common.Object.{ParameterList, SqlParameter}

case class SigninPlanner(
                          student_id: Int,
                          groupex_id: Int,
                          token: String,
                          override val planContext: PlanContext
                        ) extends Planner[String] {
  override def plan(using planContext: PlanContext): IO[String] = {
    // 查找 groupex_id 对应的 TA_id
    val getTAIdFromGroup: IO[Int] = readDBInt(
      s"SELECT TA_id FROM groupex.groupex WHERE groupex_id = ?",
      List(SqlParameter("Int", groupex_id.toString))
    ).handleErrorWith { _ =>
      IO.raiseError(new Exception(s"Groupex ID $groupex_id does not exist."))
    }

    getTAIdFromGroup.flatMap { ta_id =>
      // 查找 TA_id 对应的 student_id
      val checkStudentUnderTA = readDBBoolean(
        s"SELECT EXISTS(SELECT 1 FROM student.student WHERE TA_id = ? AND student_id = ?)",
        List(SqlParameter("Int", ta_id.toString), SqlParameter("Int", student_id.toString))
      ).handleErrorWith { _ =>
        IO.raiseError(new Exception(s"Error checking student under TA with ID $ta_id."))
      }

      checkStudentUnderTA.flatMap {
        case true =>
          // 检查 groupex_id 的 status 值
          val checkStatusValue: IO[Int] = readDBInt(
            s"SELECT status FROM groupex.groupex WHERE groupex_id = ?",
            List(SqlParameter("Int", groupex_id.toString))
          ).handleErrorWith { _ =>
            IO.raiseError(new Exception(s"Error retrieving status for Groupex ID $groupex_id."))
          }

          checkStatusValue.flatMap {
            case 1 =>
              // 检查是否已经有这个（student_id, groupex_id）数据
              val checkSignInRecord = readDBBoolean(
                s"SELECT EXISTS(SELECT 1 FROM groupex.sign_in WHERE groupex_id = ? AND student_id = ?)",
                List(SqlParameter("Int", groupex_id.toString), SqlParameter("Int", student_id.toString))
              ).handleErrorWith { _ =>
                IO.raiseError(new Exception("Error checking sign-in record."))
              }

              checkSignInRecord.flatMap {
                case false =>
                  // 检查 token 是否正确
                  val checkToken = readDBBoolean(
                    s"SELECT EXISTS(SELECT 1 FROM groupex.groupex WHERE groupex_id = ? AND token = ?)",
                    List(SqlParameter("Int", groupex_id.toString), SqlParameter("String", token))
                  ).handleErrorWith { _ =>
                    IO.raiseError(new Exception("Error checking token validity."))
                  }

                  checkToken.flatMap {
                    case true =>
                      // 继续进行签到操作
                      val insertSignInRecord = writeDB(
                        s"INSERT INTO groupex.sign_in (groupex_id, student_id) VALUES (?, ?)",
                        List(SqlParameter("Int", groupex_id.toString), SqlParameter("Int", student_id.toString))
                      ).handleErrorWith { _ =>
                        IO.raiseError(new Exception("Error inserting sign-in record."))
                      }

                      insertSignInRecord.map { _ =>
                        "Successful Sign In!"
                      }

                    case false =>
                      // 如果没有，则返回 token 错误信息
                      IO.pure("INCORRECT TOKEN!")
                  }

                case true =>
                  // 如果已经签到，则返回 "Already Signed In!"
                  IO.pure("Already Signed In!")
              }

            case status if status != 1 =>
              // 签到时间不对
              IO.pure("Not Time For Sign In Now!")
          }

        case false =>
          // 如果学生不在 TA 下，则报错
          IO.raiseError(new Exception("Student is not under the TA."))
      }

    }.handleErrorWith { error =>
      // 处理未知情况
      IO.raiseError(new Exception("Error processing sign-in request.", error))
    }
  }
}
