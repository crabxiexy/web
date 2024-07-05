package Impl

import APIs.PatientAPI.PatientQueryMessage
import Common.API.{PlanContext, Planner}
import Common.DBAPI.{writeDB, *}
import Common.Object.{ParameterList, SqlParameter}
import Common.ServiceUtils.schemaName
import cats.effect.IO
import io.circe.Json
import io.circe.generic.auto.*


case class UpdatePasswordPlanner(student_id: Int, old_password: String, new_password: String, override val planContext: PlanContext) extends Planner[String]:
  override def plan(using planContext: PlanContext): IO[String] = {
    // Check if the user exists
    val checkUserExists = readDBBoolean(s"SELECT EXISTS(SELECT 1 FROM ${schemaName}.user WHERE student_id = ? AND password = ?)",
      List(SqlParameter("Int", student_id.toString),SqlParameter("String", old_password))
    )

    checkUserExists.flatMap { exists =>
      if (!exists) {
        IO.raiseError(new Exception("person not found"))
      } else {
        // Update the user's password
        writeDB(s"UPDATE ${schemaName}.user SET password = ?  WHERE student_id = ?",
          List(SqlParameter("String", new_password),
            SqlParameter("Int", student_id.toString)
          )
        ).flatMap { _ =>
          IO.pure("Password updated successfully")
        }
      }
    }
  }
