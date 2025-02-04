package Impl

import cats.effect.IO
import io.circe.generic.auto.*
import Common.API.{PlanContext, Planner}
import Common.DBAPI.*
import Common.Object.{ParameterList, SqlParameter}
//import APIs.UserAPI.SignInResult

case class SignoutPlanner(
                          student_id: Int,
                          groupex_id: Int,
                          token: String,
                          override val planContext: PlanContext
                        ) extends Planner[String] {
  override def plan(using planContext: PlanContext): IO[String] = {
    // 查找groupex_id对应的TA_id
    val getTAIdFromGroup: IO[Int] = readDBInt(
      s"SELECT TA_id FROM groupex.groupex WHERE groupex_id = ?",
      List(SqlParameter("Int", groupex_id.toString))
    )

    // 使用flatMap来处理可能的None值
    getTAIdFromGroup.flatMap {
      case ta_id =>
        // 查找TA_id对应的student_id
        val checkStudentUnderTA = readDBBoolean(
          s"SELECT EXISTS(SELECT 1 FROM student.student WHERE TA_id = ? AND student_id = ?)",
          List(SqlParameter("Int", ta_id.toString), SqlParameter("Int", student_id.toString))
        )

        checkStudentUnderTA.flatMap {
          case true =>
            // 检查groupex_id的sign_out值
            val checkSignOutValue: IO[Int] = readDBInt(
              s"SELECT status FROM groupex.groupex WHERE groupex_id = ?",
              List(SqlParameter("Int", groupex_id.toString))
            )

            checkSignOutValue.flatMap {
              case 3 =>
                // 检查是否已经有这个（student_id,groupex_id）数据
                val checkSignOutRecord = readDBBoolean(
                  s"SELECT EXISTS(SELECT 1 FROM groupex.sign_out WHERE groupex_id = ? AND student_id = ?)",
                  List(SqlParameter("Int", groupex_id.toString), SqlParameter("Int", student_id.toString))
                )

                checkSignOutRecord.flatMap {
                  case false =>
                    val checkToken = readDBBoolean(
                      s"SELECT EXISTS(SELECT 1 FROM groupex.groupex WHERE groupex_id = ? AND token = ?)",
                      List(SqlParameter("Int", groupex_id.toString), SqlParameter("String", token))
                    )

                    checkToken.flatMap {
                      case true =>
                        // 继续进行签到操作
                        val insertSignOutRecord = writeDB(
                          s"INSERT INTO groupex.sign_out (groupex_id, student_id) VALUES (?, ?)",
                          List(SqlParameter("Int", groupex_id.toString), SqlParameter("Int", student_id.toString))
                        )

                        insertSignOutRecord.map { _ =>
                          "Successful Sign Out!"
                        }

                      case false =>
                        // 如果没有，则插入签到记录
                        IO.pure("INCORRECT TOKEN!")
                    }


                  case true =>
                    // 如果有，则输出“Already Signed In!”
                    IO.pure("Already Signed Out!")
                }

              case _ =>
                // 签退时间不对
                IO.pure("Not Time For Sign Out Now!")

              case _ =>
                // 处理未知情况
                IO.raiseError(new Exception("Unknown sign_out value."))
            }

          case false =>
            // 如果学生不在TA下，则报错
            IO.raiseError(new Exception("Student is not under the TA."))
        }

      case _ =>
        // 如果没有找到groupex_id对应的TA_id，则报错
        IO.raiseError(new Exception("Groupex_id does not correspond to any TA_id."))
    }
  }
}
