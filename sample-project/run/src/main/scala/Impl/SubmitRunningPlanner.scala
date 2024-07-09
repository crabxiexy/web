package Impl

import Common.API.{PlanContext, Planner}
import Common.DBAPI._
import Common.Object.SqlParameter
import Common.ServiceUtils.schemaName
import cats.effect.IO
import java.util.Date
import java.util.Base64
import io.circe.generic.auto.deriveEncoder
case class SubmitRunningPlanner(
                                 student_id: Int,
                                 startTime: Date,
                                 finishTime: Date,
                                 distance: Double,
                                 imgUrl: String, // Changed to store image URL
                                 override val planContext: PlanContext
                               ) extends Planner[String] {

  override def plan(using planContext: PlanContext): IO[String] = {
    // Assuming submitTime is the current time
    val submitTime = new Date()

    // Convert Date objects to java.sql.Timestamp for database insertion
    val startTimestamp = new java.sql.Timestamp(startTime.getTime)
    val finishTimestamp = new java.sql.Timestamp(finishTime.getTime)
    val submitTimestamp = new java.sql.Timestamp(submitTime.getTime)

    // Insert the running data into the database
    val submitRunning = writeDB(
      s"""
         |INSERT INTO ${schemaName}.run (student_id, startTime, finishTime, submitTime, distance, imgUrl, is_checked)
         |VALUES (?, ?, ?, ?, ?, ?, ?)
       """.stripMargin,
      List(
        SqlParameter("Int", student_id.toString),            // student_id parameter
        SqlParameter("Timestamp", startTimestamp.toString),           // startTime parameter
        SqlParameter("Timestamp", finishTimestamp.toString),          // finishTime parameter
        SqlParameter("Timestamp", submitTimestamp.toString),          // submitTime parameter
        SqlParameter("Double", distance.toString),           // distance parameter
        SqlParameter("String", imgUrl),                     // imageUrl parameter
        SqlParameter("Boolean", "false")                    // is_checked parameter as false
      )
    )

    submitRunning.flatMap { _ =>
      IO.pure("Running data submitted successfully!")
    }
  }
}