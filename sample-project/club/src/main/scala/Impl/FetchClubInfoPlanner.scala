package Impl

import Common.API.{PlanContext, Planner}
import APIs.StudentAPI.FetchStudentInfoMessage
import Common.DBAPI.{readDBRows, writeDB}
import Common.Object.{SqlParameter}
import Common.ServiceUtils.schemaName
import cats.effect.IO
import io.circe.{Json, parser}
import io.circe.generic.auto._
import io.circe.syntax._
import cats.syntax.all._ // Import all necessary cats syntax
import Common.Model.{Club, Student}
import io.circe.KeyEncoder
import io.circe.syntax._


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
          val fetchLeaderInfo = parser.parse(FetchStudentInfoMessage(leaderId).send.data)
          FetchStudentInfoMessage(leaderId).send.flatMap { jsonString =>
            parser.parse(jsonString) match {
              case Left(error) => IO.raiseError(new Exception(s"Failed to parse leader info JSON: ${error.getMessage}"))
              case Right(json) =>
                json.as[List[Student]] match {
                  case Left(error) => IO.raiseError(new Exception(s"Failed to parse leader info: ${error.getMessage}"))
                  case Right(students) => students.headOption match {
                    case Some(student) => IO.pure(student)
                    case None => IO.raiseError(new Exception("No leader info found"))
                  }
                }
            }
          }

          // Step 3: Query members of the club
          val sqlQueryMembers =
            s"""
               |SELECT member
               |FROM ${schemaName}.member
               |WHERE club_name = ?
             """.stripMargin

          val membersQuery = readDBRows(sqlQueryMembers, List(SqlParameter("String", club_name))).flatMap { jsonList =>
            val memberIds = jsonList.flatMap { json =>
              json.hcursor.downField("member").as[Int].toOption
            }
            memberIds.traverse { memberId =>
              FetchStudentInfoMessage(memberId).send.flatMap { jsonString =>
                parser.parse(jsonString) match {
                  case Left(error) => IO.raiseError(new Exception(s"Failed to parse member info JSON: ${error.getMessage}"))
                  case Right(json) =>
                    json.as[List[Student]] match {
                      case Left(error) => IO.raiseError(new Exception(s"Failed to parse member info: ${error.getMessage}"))
                      case Right(students) => students.headOption match {
                        case Some(student) => IO.pure(student)
                        case None => IO.raiseError(new Exception(s"No member info found for student ID $memberId"))
                      }
                    }
                }
              }
            }
          }

          // Step 4: Create Club object with fetched leader and members
          for {
            leader <- fetchLeaderInfo
            members <- membersQuery
          } yield Some(Club(clubId, clubName, leader, intro, department, profile, members))

        case None =>
          IO.pure(None) // Club not found
      }
    }
  }
}