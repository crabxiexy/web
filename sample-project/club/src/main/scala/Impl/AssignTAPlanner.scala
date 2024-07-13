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

case class AssignTAPlanner(student_id: Int, TA_id: Int, override val planContext: PlanContext) extends Planner[String] {
  override def plan(using planContext: PlanContext): IO[String] = {
    val checkStudentExists = readDBBoolean(s"SELECT EXISTS(SELECT 1 FROM ${schemaName}.${schemaName} WHERE student_id = ?)",
      List(SqlParameter("Int", student_id.toString))
    )
    checkStudentExists.flatMap{ exists =>
      if (!exists) {
        IO.raiseError(new Exception("student not found!"))
      }else{
        val assignTA = writeDB(
          s"UPDATE ${schemaName}.${schemaName} SET TA_id = ? WHERE student_id = ?".stripMargin,
          List(
            SqlParameter("Int", TA_id.toString),
            SqlParameter("Int", student_id.toString)
          )
        )
        assignTA.flatMap { _ =>
          IO.pure("TA assigned successfully")
        }
      }
    }
  }
}