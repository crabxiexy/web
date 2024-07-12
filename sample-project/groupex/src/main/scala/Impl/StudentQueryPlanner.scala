package Impl

import cats.effect.IO
import Common.API.{PlanContext, Planner}
import Common.DBAPI._
import Common.Object.SqlParameter
import io.circe.Json
import io.circe.generic.auto._

case class StudentQueryPlanner(
                                student_id: Int,
                                override val planContext: PlanContext
                              ) extends Planner[List[Json]] {

  override def plan(using planContext: PlanContext): IO[List[Json]] = {
    // 检查学生是否存在
    val checkStudentExists = readDBBoolean(
      s"SELECT EXISTS(SELECT 1 FROM student.student WHERE student_id = ?)",
      List(SqlParameter("Int", student_id.toString))
    )

    checkStudentExists.flatMap { exists =>
      if (!exists) {
        IO.raiseError(new Exception("Student not found!"))
      } else {
        // 查找对应的 TA_id
        val getTAforStudent = readDBInt(
          s"SELECT ta_id FROM student.student WHERE student_id = ?",
          List(SqlParameter("Int", student_id.toString))
        )

        getTAforStudent.flatMap { TA_id =>
          // 检查 TA 是否存在
          val checkTAExists = readDBBoolean(
            s"SELECT EXISTS(SELECT 1 FROM TA.TA WHERE TA_id = ?)",
            List(SqlParameter("Int", TA_id.toString))
          )

          checkTAExists.flatMap { exists =>
            if (!exists) {
              IO.raiseError(new Exception("TA not found!"))
            } else {
              // 查找 TA 对应的所有 group exercise 信息
              val sqlQuery =
                s"""
                   |SELECT groupex_id, ex_name, startTime, finishTime, location, status
                   |FROM groupex.groupex
                   |WHERE TA_id = ?
                 """.stripMargin

              readDBRows(sqlQuery, List(SqlParameter("Int", TA_id.toString)))
            }
          }
        }
      }
    }
  }
}
