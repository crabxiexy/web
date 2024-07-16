package Impl

import APIs.PatientAPI.PatientQueryMessage
import Common.API.{PlanContext, Planner}
import Common.DBAPI.{writeDB, *}
import Common.Object.{ParameterList, SqlParameter}
import Common.ServiceUtils.schemaName
import cats.effect.IO
import io.circe.Json
import io.circe.generic.auto.*
import APIs.ClubAPI.CheckClubMessage

import java.security.MessageDigest
import java.util.Base64

case class CreateActivityPlanner(club_name:String, activity_name:String, intro:String, startTime:String , finishTime:String, organizor_id :Int, lowLimit:Int, upLimit :Int, num:Int
, override val planContext: PlanContext) extends Planner[String] {
  override def plan(using planContext: PlanContext): IO[String] = {
    val checkClubExists = CheckClubMessage(club_name).send
//    val checkClubExists = readDBBoolean(s"SELECT EXISTS(SELECT 1 FROM club.info WHERE name = ?)",
//      List(SqlParameter("String", club_name))
//    )
    checkClubExists.flatMap { exists =>
      if (!exists) {
        IO.raiseError(new Exception("This club does not exist!"))
      } else {
        val checkActivityExists = readDBBoolean(s"SELECT EXISTS(SELECT 1 FROM activity.activity WHERE activity_name = ?)",
          List(SqlParameter("String", activity_name))
        )
        checkActivityExists.flatMap { exists =>
          if (exists) {
            IO.raiseError(new Exception("This activity already exists!"))
          } else {
            val insertActivity = writeDB(
              s"""
                 |WITH new_id AS (
                 |  SELECT COALESCE(MAX(activity_id), 0) + 1 AS id FROM activity.activity
                 |)
                 |INSERT INTO activity.activity (activity_id, club_name, activity_name, intro, startTime, finishTime, organizor_id, lowLimit, upLimit, num)
                 |SELECT new_id.id, ?, ?, ?, ?, ?, ?, ?, ?, 0
                 |FROM new_id
                   """.stripMargin,
              List(
                SqlParameter("String", club_name),
                SqlParameter("String", activity_name),
                SqlParameter("String", intro),
                SqlParameter("Datetime", startTime),
                SqlParameter("Datetime", finishTime),
                SqlParameter("Int", organizor_id.toString),
                SqlParameter("Int", lowLimit.toString),
                SqlParameter("Int", upLimit.toString),
              )
            )
            insertActivity.flatMap { _ =>
              IO.pure("Activity created successfully")
            }
          }
        }
      }
    }
  }
}