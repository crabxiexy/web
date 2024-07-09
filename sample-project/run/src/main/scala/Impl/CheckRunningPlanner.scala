package Impl

import APIs.PatientAPI.PatientQueryMessage
import APIs.UserAPI.StartRunningInfo
import Common.API.{PlanContext, Planner}
import Common.DBAPI.*
import Common.Object.{ParameterList, SqlParameter}
import Common.ServiceUtils.schemaName
import cats.effect.IO
import io.circe.generic.auto.*

import java.security.MessageDigest
import java.util.{Base64, Date}

case class CheckRunningPlanner(student_id: Int, override val planContext: PlanContext) extends Planner[String] {
  override def plan(using planContext: PlanContext): IO[String] = {
    // Check if the user is already registered
    val checkStudentExists = readDBBoolean(s"SELECT EXISTS(SELECT 1 FROM student.student WHERE student_id = ?)",
      List(SqlParameter("Int", student_id.toString))
    )

    checkStudentExists.flatMap { exists =>
      if (!exists) {
        IO.raiseError(new Exception("Student not found!"))
      } else {
        val startTime = new Date()
        val startRunning = writeDB(
          s"""
             |WITH new_id AS (
             |  SELECT COALESCE(MAX(run_id), 0) + 1 AS run_id FROM run.run
             |)
             |INSERT INTO run.run (run_id, student_id, startTime)
             |SELECT new_id.run_id, ?, ?
             |FROM new_id
       """.stripMargin,
          List(
            SqlParameter("Int", student_id.toString),
            SqlParameter("TIMESTAMP", startTime.getTime.toString),
          )
        )

        startRunning.flatMap { _ =>
          // 获取新插入的 run_id(I do not know whether it is correct)
          val getRunId = readDBInt(s"SELECT run_id FROM run.run WHERE student_id = ? AND startTime = ?",
            List(SqlParameter("Int", student_id.toString), SqlParameter("TIMESTAMP", startTime.getTime.toString))
          )

          getRunId.flatMap { runId =>
            IO.pure(StartRunningInfo(runId).toString)
          }
        }
      }
    }
  }
}