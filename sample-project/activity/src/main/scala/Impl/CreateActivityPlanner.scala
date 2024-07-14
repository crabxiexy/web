package Impl

import APIs.PatientAPI.PatientQueryMessage
import Common.API.{PlanContext, Planner}
import Common.DBAPI.{writeDB, *}
import Common.Object.{ParameterList, SqlParameter}
import Common.ServiceUtils.schemaName
import cats.effect.IO
import io.circe.Json
import io.circe.generic.auto.*

import java.security.MessageDigest
import java.util.Base64

case class CreateActivityPlanner(club_name:String, activity_name:String, intro:String, startTime:String , finishTime:String, organizor_id :Int, lowLimit:Int, upLimit :Int, num:Int
, override val planContext: PlanContext) extends Planner[String] {
  override def plan(using planContext: PlanContext): IO[String] = {
    val checkClubExists = readDBBoolean(s"SELECT EXISTS(SELECT 1 FROM club.info WHERE name = ?)",
      List(SqlParameter("String", club_name))
    )
    checkClubExists.flatMap { exists =>
      if (!exists) {
        IO.raiseError(new Exception("This club does not exist!"))
      } else {
        // Use SQL to get the new ID and insert the new user in one transaction
        val insertActivity = writeDB(
          s"""
             |WITH new_id AS (
             |  SELECT COALESCE(MAX(club_id), 0) + 1 AS id FROM activity.activity
             |)
             |INSERT INTO activity.activity (activity_id, club_name, activity_name, intro, startTime, finishTime, organizor_id, lowLimit, upLimit, num)
             |SELECT new_id.activity_id, ?, ?, ?, ?, ?, ?, ?, ?, 0
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
        // Chain the insertUser operation after the insertIdentity operation
        insertActivity.flatMap { _ =>
          IO.pure("Activity created successfully")
        }
      }
    }
  }
}