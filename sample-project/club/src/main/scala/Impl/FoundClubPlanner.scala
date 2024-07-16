package Impl


import Common.API.{PlanContext, Planner}
import Common.DBAPI.{writeDB, *}
import Common.Object.{ParameterList, SqlParameter}
import Common.ServiceUtils.schemaName
import cats.effect.IO
import io.circe.Json
import io.circe.generic.auto.*
import APIs.ClubAPI.AddMemberMessage

import java.security.MessageDigest
import java.util.Base64

case class FoundClubPlanner(club_name: String, leader_id: Int, club_intro: String, club_depart: String, override val planContext: PlanContext) extends Planner[String] {
  override def plan(using planContext: PlanContext): IO[String] = {
    val checkClubExists = readDBBoolean(s"SELECT EXISTS(SELECT 1 FROM ${schemaName}.info WHERE name = ?)",
      List(SqlParameter("String", club_name))
    )
    checkClubExists.flatMap { exists =>
      if (exists) {
        IO.raiseError(new Exception("This club already registered"))
      } else {
        // Use SQL to get the new ID and insert the new user in one transaction
        val insertClub = writeDB(
          s"""
             |WITH new_id AS (
             |  SELECT COALESCE(MAX(club_id), 0) + 1 AS id FROM ${schemaName}.info
             |)
             |INSERT INTO ${schemaName}.info (club_id, name, leader, intro, department)
             |SELECT new_id.id, ?, ?, ?, ?
             |FROM new_id
       """.stripMargin,
          List(
            SqlParameter("String", club_name),
            SqlParameter("Int", leader_id.toString),
            SqlParameter("String", club_intro),
            SqlParameter("String", club_depart)
          )
        )
        addmember = AddMemberMessage(club_name, student_id).send
        // Chain the insertUser operation after the insertIdentity operation
        insertClub.flatMap { _ =>
          addmember.flapMap { _ =>
            IO.pure("Club registered successfully")
          }
          
        }
      }
    }
  }
}