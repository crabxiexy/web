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

case class CheckAvailablePlanner(studentId: Int, override val planContext: PlanContext) extends Planner[List[Club]] {

  override def plan(using planContext: PlanContext): IO[List[Club]] = {
    for {
      // Step 1: Fetch the student's information using FetchStudentInfoMessage
      student <- FetchStudentInfoMessage(studentId).send

      // Step 2: Fetch all club names for the student
      clubNamesQuery =
        s"""
           |SELECT club_name
           |FROM ${schemaName}.member
           |WHERE member = ?
         """.stripMargin

      clubNames <- readDBRows(clubNamesQuery, List(SqlParameter("Int", studentId.toString)))

      // Extract club names from the result
      clubNamesList = clubNames.flatMap { json =>
        json.asObject.flatMap(_.apply("clubName").flatMap(_.asString))
      }.toSet // Use Set for efficient look-up

      // Step 3: Fetch all clubs from the info table, filtering by department
      infoQuery =
        s"""
           |SELECT club_id, name, leader, intro, department, profile
           |FROM ${schemaName}.info
           |WHERE department = ? OR department LIKE '%所有人%'
         """.stripMargin

      clubInfo <- readDBRows(infoQuery, List(SqlParameter("String", student.department)))

      // Step 4: Filter out clubs the student is already a member of
      availableClubsJson = clubInfo.filter { json =>
        val clubName = json.asObject.flatMap(_.apply("name").flatMap(_.asString)).getOrElse("")
        !clubNamesList.contains(clubName) // Only keep clubs not in the clubNamesList
      }

      // Step 5: Fetch detailed information for available clubs and their members
      availableClubs <- availableClubsJson.traverse { json =>
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

    } yield availableClubs
  }
}