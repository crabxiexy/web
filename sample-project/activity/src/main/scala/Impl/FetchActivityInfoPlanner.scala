package Impl

import cats.implicits._
import Common.API.{PlanContext, Planner}
import APIs.StudentAPI.FetchStudentInfoMessage
import Common.DBAPI.{ReadDBRowsMessage, readDBRows, writeDB}
import Common.Object.SqlParameter
import Common.ServiceUtils.schemaName
import cats.effect.IO
import io.circe.Json
import Common.Model.{Activity, Club, Student}
import io.circe._
import io.circe.generic.semiauto._
import io.circe.generic.auto._
import java.time.OffsetDateTime
import APIs.ClubAPI.FetchClubInfoMessage
case class FetchActivityInfoPlanner(activityID: Int, override val planContext: PlanContext) extends Planner[Option[Activity]] {

  override def plan(using planContext: PlanContext): IO[Option[Activity]] = {
    // Step 1: Query activity info
    val sqlQuery =
      s"""
         |SELECT activity_id, club_name, activity_name, intro, startTime, finishTime, organizor_id, lowLimit, upLimit, num
         |FROM ${schemaName}.activity
         |WHERE activity_id = ?
       """.stripMargin

    readDBRows(sqlQuery, List(SqlParameter("Int", activityID.toString))).flatMap { rows =>
      rows.headOption match {
        case Some(json) =>
          // Extract activity info from the query result
          val activityID = json.hcursor.downField("activity_id").as[Int].getOrElse(0)
          val clubName = json.hcursor.downField("club_name").as[String].getOrElse("")
          val activityName = json.hcursor.downField("activity_name").as[String].getOrElse("")
          val intro = json.hcursor.downField("intro").as[String].getOrElse("")
          val startTime = json.hcursor.downField("startTime").as[String].getOrElse("")
          val finishTime = json.hcursor.downField("finishTime").as[String].getOrElse("")
          val organizorId = json.hcursor.downField("organizor_id").as[Int].getOrElse(0)
          val lowLimit = json.hcursor.downField("lowLimit").as[Int].getOrElse(0)
          val upLimit = json.hcursor.downField("upLimit").as[Int].getOrElse(0)
          val num = json.hcursor.downField("num").as[Int].getOrElse(0)

          // Step 2: Fetch club info
          FetchClubInfoMessage(clubName).send.flatMap { club =>
            // Step 3: Fetch organizor info
            FetchStudentInfoMessage(organizorId).send.flatMap { organizor =>
              // Step 4: Query members of the activity
              val sqlQueryMembers =
                s"""
                   |SELECT member_id
                   |FROM ${schemaName}.member
                   |WHERE activity_id = ?
                 """.stripMargin

              readDBRows(sqlQueryMembers, List(SqlParameter("Int", activityID.toString))).flatMap { jsonList =>
                val memberIds = jsonList.flatMap(_.hcursor.downField("member_id").as[Int].toOption)
                memberIds.traverse { memberId =>
                  FetchStudentInfoMessage(memberId).send
                }.map { members =>
                  Some(Activity(activityID, club, activityName, intro, startTime, finishTime, organizor, lowLimit, upLimit, num, members))
                }
              }
            }
          }

        case None =>
          IO.pure(None) // Activity not found
      }
    }
  }
}