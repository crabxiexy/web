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

case class UpdateProfilePlanner(studentId: Int, profile: String, override val planContext: PlanContext) extends Planner[String] {
  override def plan(using planContext: PlanContext): IO[String] = {
    // Check if the student exists
    val checkStudentExists = readDBBoolean(
      s"SELECT EXISTS(SELECT 1 FROM ${schemaName}.user WHERE student_id = ?)",
      List(SqlParameter("Int", studentId.toString))
    )

    checkStudentExists.flatMap { exists =>
      if (!exists) {
        IO.raiseError(new Exception("Student not found!"))
      } else {
        // Update the profile
        writeDB(
          s"UPDATE ${schemaName}.students SET profile = ? WHERE student_id = ?",
          List(
            SqlParameter("String", profile),
            SqlParameter("Int", studentId.toString)
          )
        ).flatMap { _ =>
          IO.pure("Profile updated successfully")
        }
      }
    }
  }
}