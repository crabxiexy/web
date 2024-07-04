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
        val id = readDBInt(s"SELECT COALESCE(MAX(id), 0) FROM ${schemaName}.user", List())
        id.flatMap { id =>
          val role: String = if (id != 0) "student" else "supervisor"
          writeDB(s"INSERT INTO ${schemaName}.user (id, user_name, password, identity) VALUES (?, ?, ?, ?)",
            List(SqlParameter("Int", (id+1).toString),
              SqlParameter("String", userName),
              SqlParameter("String", password),
              SqlParameter("String", role)
            )
          ).flatMap { _ =>
            IO.pure("User registered successfully")
          }
        }
      }
    }
  }

