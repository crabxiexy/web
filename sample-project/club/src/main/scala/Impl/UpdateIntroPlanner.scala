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

case class UpdateIntroPlanner(club_name: String, new_intro: String, override val planContext: PlanContext) extends Planner[String] {
  override def plan(using planContext: PlanContext): IO[String] = {
    val checkClubExists = readDBBoolean(s"SELECT EXISTS(SELECT 1 FROM ${schemaName}.info WHERE name = ?)",
      List(SqlParameter("String", club_name))
    )
    checkClubExists.flatMap { exists =>
      if (!exists) {
        IO.raiseError(new Exception("club not found!"))
      } else {
        // Use SQL to get the new ID and insert the new user in one transaction
        writeDB(s"UPDATE ${schemaName}.info SET intro = ? WHERE name = ?",
          List(SqlParameter("String", new_intro), SqlParameter("String", club_name))
        ).flatMap { _ =>
          IO.pure("Introduction updated successfully")
        }
      }
    }
  }
}