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

case class CheckJointClubPlanner(studentId: Int, override val planContext: PlanContext) extends Planner[List[Club]] {

  override def plan(using planContext: PlanContext): IO[List[Club]] = {
    // Step 1: Query to get all club names for the student
    val clubNamesQuery =
      s"""
         |SELECT club_name
         |FROM ${schemaName}.member
         |WHERE member = ?
       """.stripMargin

    for {
      // Fetch the club names the student has joined
      clubNames <- readDBRows(clubNamesQuery, List(SqlParameter("Int", studentId.toString)))

      // Extract club names from the query result
      clubNamesList = clubNames.flatMap { json =>
        json.asObject.flatMap(_.apply("clubName").flatMap(_.asString))
      }.toSet // Use Set for efficient filtering

      // Fetch detailed club information if the student has joined any clubs
      result <- if (clubNamesList.isEmpty) {
        IO.pure(List.empty[Club])
      } else {
        // Step 2: Fetch full club information while filtering out clubs where the student is the leader
        val infoQuery =
          s"""
             |SELECT club_id, name, leader, intro, department, profile
             |FROM ${schemaName}.info
             |WHERE name IN (${clubNamesList.map("'" + _ + "'").mkString(",")})
           """.stripMargin

        readDBRows(infoQuery, List()).flatMap { clubInfoJsonList =>
          clubInfoJsonList.traverse { json =>
            val clubId = json.hcursor.downField("clubID").as[Int].getOrElse(0)
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
        }
      }
    } yield result
  }
}