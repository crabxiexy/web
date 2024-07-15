package Impl

import Common.API.{PlanContext, Planner}
import Common.DBAPI.{writeDB, *}
import Common.Object.{ParameterList, SqlParameter}
import Common.ServiceUtils.schemaName
import cats.effect.IO
import io.circe.Json
import io.circe.generic.auto.*

case class FoundClubPlanner(
                             club_name: String,
                             leader_id: Int,
                             club_intro: String,
                             club_depart: String,
                             profile: String,
                             override val planContext: PlanContext
                           ) extends Planner[String] {

  override def plan(using planContext: PlanContext): IO[String] = {
    val checkClubExists = readDBBoolean(
      s"SELECT EXISTS(SELECT 1 FROM ${schemaName}.info WHERE name = ?)",
      List(SqlParameter("String", club_name))
    )

    checkClubExists.flatMap { exists =>
      if (exists) {
        IO.raiseError(new Exception("This club already registered"))
      } else {
        // Use SQL to get the new ID and insert the new club in one transaction
        val insertClub = writeDB(
          s"""
             |WITH new_id AS (
             |  SELECT COALESCE(MAX(club_id), 0) + 1 AS id FROM ${schemaName}.info
             |)
             |INSERT INTO ${schemaName}.info (club_id, name, leader, intro, department, profile)
             |SELECT new_id.id, ?, ?, ?, ?, ?
             |FROM new_id
       """.stripMargin,
          List(
            SqlParameter("String", club_name),
            SqlParameter("Int", leader_id.toString),
            SqlParameter("String", club_intro),
            SqlParameter("String", club_depart),
            SqlParameter("String", profile)
          )
        )

        // Insert leader_id and club_name into the member table
        val insertMember = writeDB(
          s"""
             |INSERT INTO ${schemaName}.member (club_name, member)
             |VALUES (?, ?)
       """.stripMargin,
          List(
            SqlParameter("String", club_name),
            SqlParameter("Int", leader_id.toString)
          )
        )

        // Chain the operations
        for {
          _ <- insertClub
          _ <- insertMember
        } yield "Club registered successfully"
      }
    }
  }
}
