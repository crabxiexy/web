package Impl

import APIs.ClubAPI.{CheckLeaderMessage, CheckMemberMessage}
import Common.API.{PlanContext, Planner}
import Common.DBAPI.*
import Common.Object.SqlParameter
import Common.ServiceUtils.schemaName
import cats.effect.IO
import io.circe.generic.auto.*

import java.sql.Timestamp
import java.text.SimpleDateFormat
import java.time.{ZoneId, ZonedDateTime}
import java.time.format.DateTimeFormatter
import java.util.Date


case class SubmitHWPlanner(
                            leader_id:Int,
                            activity_id:Int,
                            student_id:Int,
                            imgUrl:String,
                                 override val planContext: PlanContext
                               ) extends Planner[String] {

  override def plan(using planContext: PlanContext): IO[String] = {
    val ClubName: IO[String] = readDBString(
      s"""
         |SELECT club_name
         |FROM activity.activity
         |WHERE activity_id = ?
                               """.stripMargin,
      List(
        SqlParameter("Int", activity_id.toString),
      )
    )
    ClubName.flatMap { club_name =>
      val checkLeader = CheckLeaderMessage(club_name, leader_id).send
      checkLeader.flatMap { exists =>
        if (!exists) {
          IO.raiseError(new Exception("You are not leader of the club!"))
        } else {
          val checkMemberExists = CheckMemberMessage(club_name, student_id).send
          checkMemberExists.flatMap { exists =>
            if (!exists) {
              IO.raiseError(new Exception("This student is not member of the club!"))
            } else {
              val submitTime = new Date()
              // Fetch ta_id for the given student_id and startTime
              val getTAId: IO[Int] = readDBInt(
                s"""
                   |SELECT ta_id
                   |FROM student.student
                   |WHERE student_id = ?
                                 """.stripMargin,
                List(
                  SqlParameter("Int", student_id.toString),
                )
              )

              // Use flatMap to ensure proper sequencing of database operations
              getTAId.flatMap { ta_id =>
                // Insert the running data into the database using ta_id
                val submitHW = writeDB(
                  s"""
                     |INSERT INTO ${schemaName}.HW (activity_id, student_id, TA_id, submitTime, imgUrl, is_checked, response)
                     |SELECT ?, ?, ?, ?, ?, ?, ?
                     |FROM new_id
                                   """.stripMargin,
                  List(
                    SqlParameter("Int", activity_id.toString),
                    SqlParameter("Int", student_id.toString),
                    SqlParameter("Int", ta_id.toString),
                    SqlParameter("Datetime", submitTime.getTime.toString),
                    SqlParameter("String", imgUrl),
                    SqlParameter("Int", "0"), // Assuming is_checked is an integer
                    SqlParameter("String", "Unchecked")
                  )
                )
                // Return the result of the database insertion
                submitHW.map { _ =>
                  "HW submitted successfully!"
                }
              }
            }
          }
        }
      }
    }

  }
}