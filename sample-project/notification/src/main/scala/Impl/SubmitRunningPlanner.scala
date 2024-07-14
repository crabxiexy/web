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



case class SubmitRunningPlanner(
                                 student_id: Int,
                                 startTime: String,
                                 finishTime: String,
                                 distance: Int,
                                 imgUrl: String, // Changed to store image URL
                                 override val planContext: PlanContext
                               ) extends Planner[String] {

  override def plan(using planContext: PlanContext): IO[String] = {

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
      val submitRunning = writeDB(
        s"""
           |WITH new_id AS (
           |  SELECT COALESCE(MAX(run_id), 0) + 1 AS run_id FROM run.run
           |)
           |INSERT INTO ${schemaName}.run (run_id,student_id, ta_id, startTime, finishTime, submitTime, distance, imgUrl, is_checked, response)
           |SELECT new_id.run_id, ?, ? , ? , ? , ? , ? , ? , ? , ?
           |FROM new_id
         """.stripMargin,
        List(
          SqlParameter("Int", student_id.toString),
          SqlParameter("Int", ta_id.toString),
          SqlParameter("Datetime", startTime),
          SqlParameter("Datetime", finishTime),
          SqlParameter("Datetime", submitTime.getTime.toString),
          SqlParameter("Int", distance.toString),
          SqlParameter("String", imgUrl),
          SqlParameter("Int", "0"), // Assuming is_checked is an integer
          SqlParameter("String", "Unchecked")
        )
      )

      // Return the result of the database insertion
      submitRunning.map { _ =>
        "Running data submitted successfully!"
      }
    }
  }
}