package Impl

import java.security.MessageDigest
import java.util.Base64
import cats.effect.IO
import io.circe.generic.auto.*
import Common.API.{PlanContext, Planner}
import Common.DBAPI.*
import Common.Object.{ParameterList, SqlParameter}
import Common.ServiceUtils.schemaName
import APIs.StudentAPI.RegisterMessage

case class RegisterMessagePlanner(student_id: Int, name: String, password: String, identity: Int, override val planContext: PlanContext) extends Planner[String] {
  override def plan(using planContext: PlanContext): IO[String] = {
    // Check if the identity is already registered
    /*
    val identityTable = identity.toString match {
      case "1" => "admin"
      case "2" => "student"
      case "3" => "TA"
      case _ => throw new Exception("Unknown user identity")
    }
     */

    val checkUserExists = readDBBoolean(s"SELECT EXISTS(SELECT 1 FROM ${schemaName}.user WHERE student_id = ?)",
      List(SqlParameter("Int", student_id.toString))
    )
    checkUserExists.flatMap { exists =>
      if (exists) {
        IO.raiseError(new Exception("This user already registered"))
      } else {
        // Hash the password
        val hashedPassword = hashPassword(password)
        val insertIdentity = identity.toString match{
          case "1" => IO.unit
          case "2" => RegisterMessage(student_id).send
          case "3" => IO.unit
          case _=> throw new Exception("Unknown user identity")
        }
        // Insert the identity first
        /*
        val insertIdentity = writeDB(
          s"""
             INSERT INTO ${identityTable}.${identityTable} (${identityTable}_id) VALUES(?)
       """.stripMargin,
          List(
            SqlParameter("Int", student_id.toString),
          )
        )
         */
        // Use SQL to get the new ID and insert the new user in one transaction
        val insertUser = writeDB(
          s"""
             |WITH new_id AS (
             |  SELECT COALESCE(MAX(id), 0) + 1 AS id FROM ${schemaName}.user
             |)
             |INSERT INTO ${schemaName}.user (id, name, password, student_id, identity)
             |SELECT new_id.id, ?, ?, ?, ?
             |FROM new_id
       """.stripMargin,
          List(
            SqlParameter("String", name),
            SqlParameter("String", hashedPassword),
            SqlParameter("Int", student_id.toString),
            SqlParameter("Int", identity.toString)
          )
        )
        // Chain the insertUser operation after the insertIdentity operation
        insertIdentity.flatMap { _ =>
          insertUser.flatMap { _ =>
            IO.pure("User registered successfully")
          }
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
