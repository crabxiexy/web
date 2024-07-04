package Impl

import APIs.PatientAPI.PatientQueryMessage
import Common.API.{PlanContext, Planner}
import Common.DBAPI.{writeDB, *}
import Common.Object.{ParameterList, SqlParameter}
import Common.ServiceUtils.schemaName
import cats.effect.IO
import io.circe.Json
import io.circe.generic.auto.*


case class UpdatePasswordPlanner(userid: Int, newuserName: String, newPassword: String, override val planContext: PlanContext) extends Planner[String]:
  override def plan(using planContext: PlanContext): IO[String] = {
    // Check if the user exists
    val checkUserExists = readDBBoolean(s"SELECT EXISTS(SELECT 1 FROM ${schemaName}.user WHERE id = ?)",
      List(SqlParameter("Int", userid.toString))
    )

    checkUserExists.flatMap { exists =>
      if (!exists) {
        IO.raiseError(new Exception("user not found"))
      } else {
        // Update the user's password
        writeDB(s"UPDATE ${schemaName}.user SET password = ? AND user_name = ? WHERE id = ?",
          List(SqlParameter("String", newPassword),
            SqlParameter("String", newuserName),
            SqlParameter("Int", userid.toString)
          )
        ).flatMap { _ =>
          IO.pure("Password updated successfully")
        }
      }
    }
  }
