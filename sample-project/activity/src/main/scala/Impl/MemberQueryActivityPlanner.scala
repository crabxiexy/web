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
import APIs.ClubAPI.FetchClubInfoMessage
import APIs.ClubAPI.CheckMemberMessage

case class MemberQueryActivityPlanner(
                                       member_id: Int,
                                       club_name: String,
                                       currentTime: String,
                                       status1: Int,
                                       status2: Int,
                                       status3: Int,
                                       override val planContext: PlanContext
                                     ) extends Planner[List[Activity]] {

  override def plan(using planContext: PlanContext): IO[List[Activity]] = {
    // Check if the member is part of the specified club
    val checkMemberExists = CheckMemberMessage(club_name, member_id).send

    checkMemberExists.flatMap { exists =>
      if (!exists) {
        IO.raiseError(new Exception("You are not in this club!"))
      } else {
        // Construct SQL query based on status values
        val (operatorStart, operatorFinish) = status1 match {
          case 0 => (">", ">")
          case 1 => ("<", ">")
          case 2 => ("<", "<")
          case 3 => ("", ">")
          case _ => throw new IllegalArgumentException("Invalid status1 value")
        }

        val timeCondition = status1 match {
          case 0 | 1 | 2 => s"a.startTime $operatorStart ? AND a.finishTime $operatorFinish ?"
          case 3 => s"a.finishTime $operatorFinish ?"
          case _ => throw new IllegalArgumentException("Invalid status1 value")
        }

        val joinCondition = status2 match {
          case 0 => "EXISTS"
          case 1 => "NOT EXISTS"
          case _ => throw new IllegalArgumentException("Invalid status2 value")
        }

        val status3Condition = status3 match {
          case 0 => ""
          case 1 => "AND NOT EXISTS (SELECT 1 FROM activity.member am WHERE am.activity_id = a.activity_id AND am.member_id = ?) AND a.num < a.upLimit AND ? < a.finishTime"
          case _ => throw new IllegalArgumentException("Invalid status3 value")
        }

        val sqlQuery =
          s"""
             |SELECT a.activity_id, a.club_name, a.activity_name, a.intro, a.startTime, a.finishTime, a.organizor_id, a.lowLimit, a.upLimit, a.num
             |FROM ${schemaName}.activity a
             |WHERE a.club_name = ? AND $timeCondition
             |AND $joinCondition (
             |  SELECT 1 FROM ${schemaName}.member am
             |  WHERE am.activity_id = a.activity_id AND am.member_id = ?
             |) $status3Condition
           """.stripMargin

        // Prepare query parameters
        val parameters = List(SqlParameter("String", club_name), SqlParameter("DateTime", currentTime)) ++
          (if (status1 != 0 && status1 != 3) List(SqlParameter("DateTime", currentTime)) else Nil) ++
          List(SqlParameter("Int", member_id.toString)) ++
          (if (status3 == 1) List(SqlParameter("Int", member_id.toString), SqlParameter("DateTime", currentTime)) else Nil)

        // Execute the query and return the results
        for {
          activityRows <- readDBRows(sqlQuery, parameters)
          activities <- activityRows.traverse { json =>
            val activityID = json.hcursor.downField("activityID").as[Int].getOrElse(0)
            val clubName = json.hcursor.downField("clubName").as[String].getOrElse("")
            val activityName = json.hcursor.downField("activityName").as[String].getOrElse("")
            val intro = json.hcursor.downField("intro").as[String].getOrElse("")
            val startTime = json.hcursor.downField("starttime").as[String].getOrElse("")
            val finishTime = json.hcursor.downField("finishtime").as[String].getOrElse("")
            val organizorId = json.hcursor.downField("organizorID").as[Int].getOrElse(0)
            val lowLimit = json.hcursor.downField("lowlimit").as[Int].getOrElse(0)
            val upLimit = json.hcursor.downField("upkimit").as[Int].getOrElse(0)
            val num = json.hcursor.downField("num").as[Int].getOrElse(0)

            // Fetch club info
            val fetchClubInfo = FetchClubInfoMessage(clubName).send

            // Fetch organizer info
            val fetchOrganizorInfo = FetchStudentInfoMessage(organizorId).send

            // Fetch members info
            val membersQuery =
              s"""
                 |SELECT member_id
                 |FROM ${schemaName}.member
                 |WHERE activity_id = ?
               """.stripMargin

            val fetchMembers = readDBRows(membersQuery, List(SqlParameter("Int", activityID.toString))).flatMap { memberRows =>
              val memberIds = memberRows.flatMap { memberJson =>
                // Assuming the `member_id` field is an array in the returned JSON
                memberJson.hcursor.downField("member_id").as[List[Int]].getOrElse(List.empty[Int])
              }

              memberIds.traverse { memberId =>
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
  }
}
