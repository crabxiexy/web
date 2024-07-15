package Impl

import APIs.PatientAPI.PatientQueryMessage
import Common.API.{PlanContext, Planner}
import Common.DBAPI.{writeDB, *}
import Common.Object.{ParameterList, SqlParameter}
import Common.ServiceUtils.schemaName
import cats.effect.IO
import io.circe.Json
import io.circe.generic.auto.*

case class ReplyAppPlanner(club_name: String, result: Int, response: String, override val planContext: PlanContext) extends Planner[String] {
  override def plan(using planContext: PlanContext): IO[String] = {
    val checkAppExists = readDBBoolean(s"SELECT EXISTS(SELECT 1 FROM ${schemaName}.application WHERE name = ? AND is_checked = 0)",
      List(SqlParameter("String", club_name))
    )
    checkAppExists.flatMap { exists =>
      if (!exists) {
        IO.raiseError(new Exception("Application not found or already checked!"))
      } else {
        // Use SQL to update the application
        val replyApplication = writeDB(
          s"""
             |UPDATE ${schemaName}.application
             |SET is_checked = 1, result = ?, response = ?
             |WHERE name = ?
       """.stripMargin,
          List(
            SqlParameter("Int", result.toString),
            SqlParameter("String", response),
            SqlParameter("String", club_name)
          )
        )
        // Chain the update operation
        replyApplication.flatMap { _ =>
          IO.pure("Application replied successfully")
        }
      }
    }
  }
}
