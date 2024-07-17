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
    // Check if the student exists
    val checkStudentExists = readDBBoolean(
      s"SELECT EXISTS(SELECT 1 FROM student.student WHERE student_id = ?)",
      List(SqlParameter("Int", student_id.toString))
    )

    checkStudentExists.flatMap { exists =>
      if (!exists) {
        IO.raiseError(new Exception("Student not found!"))
      } else {
        // Retrieve the corresponding TA_id
        val getTAforStudent = readDBInt(
          s"SELECT ta_id FROM student.student WHERE student_id = ?",
          List(SqlParameter("Int", student_id.toString))
        )

        getTAforStudent.flatMap { TA_id =>
          // Query to get all group exercise information for the TA
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
