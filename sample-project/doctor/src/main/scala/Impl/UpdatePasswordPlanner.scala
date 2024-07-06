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
import cats.effect.IO

case class UpdatePasswordPlanner(student_id: Int, old_password: String, new_password: String, override val planContext: PlanContext) extends Planner[String] {
  override def plan(using planContext: PlanContext): IO[String] = {
    // Hash the old password
    val hashedOldPassword = hashPassword(old_password)

    // Check if the user exists with the old password
    val checkUserExists = readDBBoolean(s"SELECT EXISTS(SELECT 1 FROM ${schemaName}.user WHERE student_id = ? AND password = ?)",
      List(SqlParameter("Int", student_id.toString), SqlParameter("String", hashedOldPassword))
    )

    checkUserExists.flatMap { exists =>
      if (!exists) {
        IO.raiseError(new Exception("person not found"))
      } else {
        // Hash the new password
        val hashedNewPassword = hashPassword(new_password)

        // Update the user's password
        writeDB(s"UPDATE ${schemaName}.user SET password = ? WHERE student_id = ?",
          List(SqlParameter("String", hashedNewPassword), SqlParameter("Int", student_id.toString))
        ).flatMap { _ =>
          IO.pure("Password updated successfully")
        }
      }
    }
  }

  private def hashPassword(password: String): String = {
    val digest = MessageDigest.getInstance("SHA-256")
    val hashBytes = digest.digest(password.getBytes("UTF-8"))
    Base64.getEncoder.encodeToString(hashBytes)
  }
}
