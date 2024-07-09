package Impl

import java.util.Date
import java.security.MessageDigest
import java.util.Base64
import cats.effect.IO
import io.circe.generic.auto.*
import Common.API.{PlanContext, Planner}
import Common.DBAPI.*
import Common.Object.{ParameterList, SqlParameter}
import Common.ServiceUtils.schemaName
import APIs.PatientAPI.PatientQueryMessage
import APIs.UserAPI.StartRunningInfo
import cats.effect.IO
import io.circe.generic.auto.*


case class SubmitRunningPlanner(student_id: Int,
                                startTime: Date,
                                finishTime: Date,
                                distance: Double,
                                png: Array[Byte],
                                override val planContext: PlanContext) extends Planner[String] {

  override def plan(using planContext: PlanContext): IO[String] = {
    // Assuming submitTime is the current time
    val submitTime = new Date()

    // Insert the running data into the database
    val submitRunning = writeDB(
      s"""
         |INSERT INTO ${schemaName}.run (student_id, startTime, finishTime, submitTime, distance, png, is_checked)
         |VALUES (?, ?, ?, ?, ?, ?, ?)
       """.stripMargin,
      List(
        SqlParameter("Int", student_id.toString),            // student_id parameter
        SqlParameter("Timestamp", startTime.getTime.toString), // startTime parameter
        SqlParameter("Timestamp", finishTime.getTime.toString), // finishTime parameter
        SqlParameter("Timestamp", submitTime.getTime.toString), // submitTime parameter
        SqlParameter("Double", distance.toString),           // distance parameter
        SqlParameter("Array[Byte]", Base64.getEncoder.encodeToString(png)), // png parameter
        SqlParameter("Boolean", "false")                    // is_checked parameter as false
      )
    )

    submitRunning.flatMap { _ =>
      IO.pure("Running data submitted successfully!")
    }
  }
}