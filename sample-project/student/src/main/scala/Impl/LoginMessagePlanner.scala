package Impl

import cats.effect.IO
import io.circe.Json
import io.circe.generic.auto.*
import Common.API.{PlanContext, Planner}
import Common.DBAPI.{writeDB, *}
import Common.Object.{ParameterList, SqlParameter}
import Common.ServiceUtils.schemaName
import APIs.PatientAPI.PatientQueryMessage
import cats.effect.IO
import io.circe.generic.auto.*


import java.security.MessageDigest
import java.util.Base64
import cats.effect.IO

case class LoginMessagePlanner(student_id: Int, password: String, identity: Int, override val planContext: PlanContext) extends Planner[String] {
  override def plan(using planContext: PlanContext): IO[String] = {
    // Hash the input password
    val hashedPassword = hashPassword(password)

    // Attempt to validate the user by reading the rows from the database
    readDBRows(
      s"SELECT student_id FROM ${schemaName}.user WHERE student_id = ? AND password = ? AND identity = ?",
      List(SqlParameter("Int", student_id.toString), SqlParameter("String", hashedPassword), SqlParameter("Int", identity.toString))
    ).map {
      case Nil => "Invalid user"
      case _ => "Valid user"
    }
  }

  private def hashPassword(password: String): String = {
    val digest = MessageDigest.getInstance("SHA-256")
    val hashBytes = digest.digest(password.getBytes("UTF-8"))
    Base64.getEncoder.encodeToString(hashBytes)
  }
}