package Impl

import cats.effect.IO
import io.circe.Json
import io.circe.generic.auto._
import Common.API.{PlanContext, Planner}
import Common.DBAPI.{writeDB, readDBRows, *}
import Common.Object.{ParameterList, SqlParameter}
import Common.ServiceUtils.schemaName

import java.security.MessageDigest
import java.util.Base64
import java.util.UUID

case class LoginMessagePlanner(studentId: Int, password: String, identity: Int, override val planContext: PlanContext) extends Planner[String] {
  override def plan(using planContext: PlanContext): IO[String] = {
    // Hash the input password
    val hashedPassword = hashPassword(password)

    // Attempt to validate the user by reading the rows from the database
    readDBRows(
      s"SELECT student_id FROM ${schemaName}.user WHERE student_id = ? AND password = ? AND identity = ?",
      List(
        SqlParameter("Int", studentId.toString),
        SqlParameter("String", hashedPassword),
        SqlParameter("Int", identity.toString)
      )
    ).flatMap {
      case Nil =>
        IO.pure("Invalid user") // Return invalid message
      case _ =>
        val token = generateToken()
        // Insert the login details into the state table
        writeDB(
          s"INSERT INTO ${schemaName}.state (student_id, submit_time, token) VALUES (?, CURRENT_TIMESTAMP, ?)",
          List(SqlParameter("Int", studentId.toString), SqlParameter("String", token))
        ).map(_ => token) // Return the generated token
    }
  }

  private def hashPassword(password: String): String = {
    val digest = MessageDigest.getInstance("SHA-256")
    val hashBytes = digest.digest(password.getBytes("UTF-8"))
    Base64.getEncoder.encodeToString(hashBytes)
  }

  private def generateToken(): String = {
    UUID.randomUUID().toString
  }
}
