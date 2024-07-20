package Impl

import cats.Traverse.nonInheritedOps.toTraverseOps
import Common.API.{PlanContext, Planner}
import APIs.StudentAPI.FetchStudentInfoMessage
import Common.DBAPI.{ReadDBRowsMessage, readDBRows}
import Common.Object.SqlParameter
import Common.ServiceUtils.schemaName
import cats.effect.IO
import io.circe.Json
import io.circe.parser.parse
import Common.Model.{Club, Student}
import io.circe._
import io.circe.generic.semiauto._
import io.circe.syntax._
import io.circe.generic.auto._

case class FetchClubInfoPlanner(club_name: String, override val planContext: PlanContext) extends Planner[Option[Club]] {

  override def plan(using planContext: PlanContext): IO[Option[Club]] = {
    // Step 1: Query club info including leader
    val sqlQuery =
      s"""
         |SELECT club_id, name, leader, intro, department, profile
         |FROM ${schemaName}.info
         |WHERE name = ?
       """.stripMargin

    readDBRows(sqlQuery, List(SqlParameter("String", club_name))).flatMap { rows =>
      rows.headOption match {
        case Some(json) =>
          // Extract club info from the query result
          val clubId = json.hcursor.downField("club_id").as[Int].getOrElse(0)
          val clubName = json.hcursor.downField("name").as[String].getOrElse("")
          val leaderId = json.hcursor.downField("leader").as[Int].getOrElse(0)
          val intro = json.hcursor.downField("intro").as[String].getOrElse("")
          val department = json.hcursor.downField("department").as[String].getOrElse("")
          val profile = json.hcursor.downField("profile").as[String].getOrElse("")
          
          // Step 2: Fetch student info for leader
          FetchStudentInfoMessage(leaderId).send.flatMap { leaderJsonList =>
            leaderJsonList.headOption match {
              case Some(leaderJson) =>
                val leader = leaderJson.as[Student].getOrElse(throw new Exception("Failed to decode leader info"))

                // Step 3: Query members of the club
                val sqlQueryMembers =
                  s"""
                     |SELECT member
                     |FROM ${schemaName}.member
                     |WHERE club_name = ?
                   """.stripMargin

                readDBRows(sqlQueryMembers, List(SqlParameter("String", club_name))).flatMap { jsonList =>
                  val memberIds = jsonList.flatMap(_.hcursor.downField("member").as[Int].toOption)
                  memberIds.traverse { memberId =>
                    FetchStudentInfoMessage(memberId).send.flatMap { memberJsonList =>
                      memberJsonList.headOption match {
                        case Some(memberJson) =>
                          IO.pure(memberJson.as[Student].getOrElse(throw new Exception("Failed to decode member info")))
                        case None => IO.raiseError(new Exception("Empty member info"))
                      }
                    }
                  }.map { members =>
                    Some(Club(clubId, clubName, leader, intro, department, profile, members))
                  }
                }

              case None => IO.raiseError(new Exception("Empty leader info"))
            }
          }

        case None =>
          IO.pure(None) // Club not found
      }
    }
  }
}