package Impl

import APIs.PatientAPI.PatientQueryMessage
import Common.API.{PlanContext, Planner}
import Common.DBAPI.{writeDB, *}
import Common.Object.{ParameterList, SqlParameter}
import Common.ServiceUtils.schemaName
import cats.effect.IO
import io.circe.Json
import io.circe.generic.auto.*

import java.security.MessageDigest
import java.util.Base64

case class AssignScorePlanner(student_id: Int, score: Int, override val planContext: PlanContext) extends Planner[String] {
  override def plan(using planContext: PlanContext): IO[String] = {
    val checkStudentExists = readDBBoolean(s"SELECT EXISTS(SELECT 1 FROM ${schemaName}.${schemaName} WHERE student_id = ?)",
      List(SqlParameter("Int", student_id.toString))
    )
    checkStudentExists.flatMap{ exists =>
      if (!exists) {
        IO.raiseError(new Exception("student not found!"))
      }else{
        val assignScore = writeDB(
          s"UPDATE ${schemaName}.${schemaName} SET score = ? WHERE student_id = ?".stripMargin,
          List(
            SqlParameter("Int", score.toString),
            SqlParameter("Int", student_id.toString)
          )
        )
        assignScore.flatMap { _ =>
          IO.pure("Score assigned successfully")
        }
      }
    }
  }
}