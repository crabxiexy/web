package Impl

import java.sql.Timestamp
import java.time.format.DateTimeFormatter
import java.time.{Instant, ZoneId, ZonedDateTime}

import Common.API.{PlanContext, Planner}
import Common.DBAPI._
import Common.Object.SqlParameter
import Common.ServiceUtils.schemaName
import cats.effect.IO
case class SubmitRunningPlanner(
                                 student_id: Int,
                                 startTime: String,
                                 finishTime: String,
                                 distance: Double,
                                 imgUrl: String, // Changed to store image URL
                                 override val planContext: PlanContext
                               ) extends Planner[String] {

  override def plan(using planContext: PlanContext): IO[String] = {
    // Assuming submitTime is the current time 
  def parseISOToTimestamp(isoString: String): Timestamp = {
      val formatter = DateTimeFormatter.ISO_DATE_TIME
      val zonedDateTime = ZonedDateTime.parse(isoString, formatter.withZone(ZoneId.systemDefault()))
      Timestamp.from(zonedDateTime.toInstant)
    }

    // Convert Date objects to java.sql.Timestamp for database insertion
    val startTimestamp = parseISOToTimestamp(startTime)
    val finishTimestamp = parseISOToTimestamp(finishTime)

    // Assuming submitTime is the current time in UTC
    val submitTimestamp = Timestamp.from(Instant.now())
    val fetchTaIdQuery =
      s"""
         |SELECT ta_id
         |FROM student.student
         |WHERE student_id = ?
              """.stripMargin

    val ta_id = readDBRows(
      fetchTaIdQuery,
      List(SqlParameter("Int", student_id.toString))
    )
    // Insert the running data into the database
    val submitRunning = writeDB(
      s"""
         |INSERT INTO ${schemaName}.run (student_id, ta_id, startTime, finishTime, submitTime, distance, imgUrl, is_checked)
         |VALUES (?, ?, ?, ?, ?, ?, ?)
       """.stripMargin,
      List(
        SqlParameter("Int", student_id.toString),
        SqlParameter("Int", ta_id.toString),// student_id parameter
        SqlParameter("Timestamp", startTimestamp.toString),           // startTime parameter
        SqlParameter("Timestamp", finishTimestamp.toString),          // finishTime parameter
        SqlParameter("Timestamp", submitTimestamp.toString),          // submitTime parameter
        SqlParameter("Double", distance.toString),           // distance parameter
        SqlParameter("String", imgUrl),                     // imageUrl parameter
        SqlParameter("Int", "0")                    // is_checked parameter as false
      )
    )

    submitRunning.flatMap { _ =>
      IO.pure("Running data submitted successfully!")
    }
  }
}