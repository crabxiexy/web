package Impl

import cats.effect.IO
import io.circe.generic.auto.*
import Common.API.{PlanContext, Planner}
import Common.DBAPI.{writeDB, *}
import Common.Object.{ParameterList, SqlParameter}
import Common.ServiceUtils.schemaName
import APIs.PatientAPI.PatientQueryMessage
import cats.effect.IO
import io.circe.generic.auto.*


case class RegisterMessagePlanner(userName: String, password: String,override val planContext: PlanContext) extends Planner[String]:
  override def plan(using planContext: PlanContext): IO[String] = {
    // Check if the user is already registered
    val checkUserExists = readDBBoolean(s"SELECT EXISTS(SELECT 1 FROM ${schemaName}.user WHERE user_name = ?)",
        List(SqlParameter("String", userName))
      )

    checkUserExists.flatMap { exists =>
      if (exists) {
        IO.raiseError(new Exception("already registered"))
      } else {
        // Use SQL to get the new ID and insert the new user in one transaction
        val insertUser = writeDB(
          s"""
             |WITH new_id AS (
             |  SELECT COALESCE(MAX(id), 0) + 1 AS id FROM ${schemaName}.user
             |)
             |INSERT INTO ${schemaName}.user (id, user_name, password, identity)
             |SELECT new_id.id, ?, ?, CASE WHEN new_id.id = 1 THEN 'supervisor' ELSE 'student' END
             |FROM new_id
           """.stripMargin,
          List(
            SqlParameter("String", userName),
            SqlParameter("String", password)
          )
        )

        insertUser.flatMap { _ =>
          IO.pure("User registered successfully")
        }
      }
    }
  }