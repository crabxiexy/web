package Impl

import java.sql.Timestamp
import java.text.SimpleDateFormat
import java.util.Date
import java.time.ZoneId
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter
import Common.API.{PlanContext, Planner}
import Common.DBAPI._
import Common.Object.SqlParameter
import Common.ServiceUtils.schemaName
import cats.effect.IO
import io.circe.generic.auto._
import APIs.ClubAPI.CheckMemberMessage
import APIs.ClubAPI.CheckLeaderMessage



case class SubmitHWPlanner(
                            HW_id:Int,
                            startTime:String ,
                            finishTime:String,
                            HW_name:String,
                            student_id:Int,
                            leader_id:Int,
                            club_name:String,
                            imgUrl:String,
                                 override val planContext: PlanContext
                               ) extends Planner[String] {

  override def plan(using planContext: PlanContext): IO[String] = {
    val checkLeader = CheckLeaderMessage(club_name, leader_id).send
    checkLeader.flatMap { exists =>
      if (!exists) {
        IO.raiseError(new Exception("You are not leader of the club!"))
      } else {
        val checkMemberExists = CheckMemberMessage(club_name, student_id).send
        checkMemberExists.flatMap { exists =>
          if (!exists) {
            IO.raiseError(new Exception("This student is not member of the club!"))
          }else {
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
                   |WITH new_id AS (
                   |  SELECT COALESCE(MAX(HW_id), 0) + 1 AS HW_id FROM HW.HW
                   |)
                   |INSERT INTO ${schemaName}.HW ( HW_id,startTime, finishTime, submitTime,HW_name, student_id, leader_id, TA_id, club_name, imgUrl, is_checked, response)
                   |SELECT new_id.HW_id, ?, ? , ? , ? , ? , ? , ? , ? , ?
                   |FROM new_id
                             """.stripMargin,
                List(

                  SqlParameter("Datetime", startTime),
                  SqlParameter("Datetime", finishTime),
                  SqlParameter("Datetime", submitTime.getTime.toString),
                  SqlParameter("String", HW_name),
                  SqlParameter("Int", student_id.toString),
                  SqlParameter("Int", leader_id.toString),
                  SqlParameter("Int", ta_id.toString),
                  SqlParameter("String", club_name),
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