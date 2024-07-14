package Impl


import Common.API.{PlanContext, Planner}
import Common.DBAPI.{writeDB, *}
import Common.Object.{ParameterList, SqlParameter}
import Common.ServiceUtils.schemaName
import cats.effect.IO
import io.circe.Json
import io.circe.generic.auto.*

import java.security.MessageDigest
import java.util.Base64

case class CreateAppPlanner(club_name: String, leader_id: Int, club_intro: String, club_depart: String, override val planContext: PlanContext) extends Planner[String] {
  override def plan(using planContext: PlanContext): IO[String] = {
    val checkClubExists = readDBBoolean(s"SELECT EXISTS(SELECT 1 FROM ${schemaName}.info WHERE name = ?)",
      List(SqlParameter("String", club_name))
    )
    checkClubExists.flatMap { exists =>
      if (exists) {
        IO.raiseError(new Exception("This club already registered"))
      } else {
        // Use SQL to insert the new application in one transaction
        val insertApplication = writeDB(
          s"""
             |INSERT INTO ${schemaName}.application (name, leader, intro, department, is_checked, result, response)
             |VALUES (?, ?, ?, ?, FALSE, FALSE, 'NONE')
       """.stripMargin,
          List(
            SqlParameter("String", club_name),
            SqlParameter("Int", leader_id.toString),
            SqlParameter("String", club_intro),
            SqlParameter("String", club_depart)
          )
        )
        // Chain the insertApplication operation after the checkClubExists operation
        insertApplication.flatMap { _ =>
          IO.pure("Application created successfully")
        }
      }
    }
  }
}