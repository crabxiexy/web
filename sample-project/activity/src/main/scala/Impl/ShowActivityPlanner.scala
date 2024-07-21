package Impl

import APIs.StudentAPI.FetchStudentInfoMessage
import Common.API.{PlanContext, Planner}
import Common.DBAPI.readDBRows
import Common.Object.SqlParameter
import Common.ServiceUtils.schemaName
import cats.effect.IO
import cats.implicits._
import io.circe.Json
import io.circe.generic.auto._
import Common.Model.{Activity, Club, Student}
import java.time.OffsetDateTime
import APIs.ClubAPI.FetchClubInfoMessage

case class ShowActivityPlanner(
                                club_name: String,
                                override val planContext: PlanContext
                              ) extends Planner[List[Activity]] {

  override def plan(using planContext: PlanContext): IO[List[Activity]] = {
    // SQL query to retrieve all activities for the specified club_name
    val sqlQuery =
      s"""
         |SELECT a.activity_id, a.club_name, a.activity_name, a.intro, a.startTime, a.finishTime, a.organizor_id, a.lowLimit, a.upLimit, a.num
         |FROM ${schemaName}.activity a
         |WHERE a.club_name = ?
         """.stripMargin

    // Prepare parameters for the query
    val parameters = List(SqlParameter("String", club_name))

    // Execute the query and return the results
    for {
      activityRows <- readDBRows(sqlQuery, parameters)
      activities <- activityRows.traverse { json =>
        val activityID = json.hcursor.downField("activityID").as[Int].getOrElse(0)
        val clubName = json.hcursor.downField("clubName").as[String].getOrElse("")
        val activityName = json.hcursor.downField("activityName").as[String].getOrElse("")
        val intro = json.hcursor.downField("intro").as[String].getOrElse("")
        val startTime = json.hcursor.downField("startTime").as[String].getOrElse("")
        val finishTime = json.hcursor.downField("finishTime").as[String].getOrElse("")
        val organizorId = json.hcursor.downField("organizorID").as[Int].getOrElse(0)
        val lowLimit = json.hcursor.downField("lowLimit").as[Int].getOrElse(0)
        val upLimit = json.hcursor.downField("upLimit").as[Int].getOrElse(0)
        val num = json.hcursor.downField("num").as[Int].getOrElse(0)

        // Fetch club info
        val fetchClubInfo = FetchClubInfoMessage(clubName).send

        // Fetch organizer info
        val fetchOrganizorInfo = FetchStudentInfoMessage(organizorId).send

        // Fetch members info
        val membersQuery =
          s"""
             |SELECT member
             |FROM ${schemaName}.member
             |WHERE activity_id = ?
           """.stripMargin

        val fetchMembers = readDBRows(membersQuery, List(SqlParameter("Int", activityID.toString))).flatMap { memberRows =>
          memberRows.traverse { memberJson =>
            val memberId = memberJson.hcursor.downField("member").as[Int].getOrElse(0)
            FetchStudentInfoMessage(memberId).send
          }
        }

        for {
          club <- fetchClubInfo
          organizor <- fetchOrganizorInfo
          members <- fetchMembers
        } yield {
          Activity(
            activityID = activityID,
            club = club,
            activityName = activityName,
            intro = intro,
            startTime = startTime,
            finishTime = finishTime,
            organizor = organizor,
            lowLimit = lowLimit,
            upLimit = upLimit,
            num = num,
            members = members
          )
        }
      }
    } yield activities
  }
}