package Impl

import cats.effect.IO
import cats.implicits._
import Common.API.{PlanContext, Planner}
import APIs.StudentAPI.FetchStudentInfoMessage
import Common.DBAPI.{readDBRows}
import Common.Object.SqlParameter
import Common.ServiceUtils.schemaName
import Common.Model.{Club, Student}
import io.circe.generic.auto.*
import Common.DBAPI.{ReadDBRowsMessage, readDBRows}
import io.circe._
case class LeaderQueryPlanner(leader_id: Int, override val planContext: PlanContext) extends Planner[List[Club]] {
  override def plan(using planContext: PlanContext): IO[List[Club]] = {
    val sqlQuery =
      s"""
         |SELECT club_id, name, leader, intro, department, profile
         |FROM ${schemaName}.info
         |WHERE leader = ?
       """.stripMargin

    for {
      // Step 1: Fetch the clubs led by the specified leader
      clubsJson <- readDBRows(sqlQuery, List(SqlParameter("Int", leader_id.toString)))

      // Step 2: Map the result to a list of Club objects
      clubs <- clubsJson.traverse { json =>
        val clubId = json.hcursor.downField("club_id").as[Int].getOrElse(0)
        val clubName = json.hcursor.downField("name").as[String].getOrElse("")
        val leaderId = json.hcursor.downField("leader").as[Int].getOrElse(0)
        val intro = json.hcursor.downField("intro").as[String].getOrElse("")
        val department = json.hcursor.downField("department").as[String].getOrElse("")
        val profile = json.hcursor.downField("profile").as[String].getOrElse("")

        // Fetch leader information
        FetchStudentInfoMessage(leaderId).send.flatMap { leader =>
          // Fetch members of the club
          val membersQuery =
            s"""
               |SELECT member
               |FROM ${schemaName}.member
               |WHERE club_name = ?
             """.stripMargin

          readDBRows(membersQuery, List(SqlParameter("String", clubName))).flatMap { membersJsonList =>
            val memberIds = membersJsonList.flatMap(_.hcursor.downField("member").as[Int].toOption)
            memberIds.traverse { memberId =>
              FetchStudentInfoMessage(memberId).send
            }.map { members =>
              Club(clubId, clubName, leader, intro, department, profile, members)
            }
          }
        }
      }
    } yield clubs
  }
}