package Impl

import java.sql.Timestamp
import java.util.Date
import Common.API.{PlanContext, Planner}
import Common.DBAPI._
import Common.Object.SqlParameter
import Common.ServiceUtils.schemaName
import cats.effect.IO
import io.circe.generic.auto._
case class CheckRunningPlanner(
                                run_id: Int,
                                is_checked: Int,
                                response: String,
                                override val planContext: PlanContext
                              ) extends Planner[String] {

  override def plan(using planContext: PlanContext): IO[String] = {
    // Assuming submitTime is the current time
    val submitTime = new Date()

    // Update the running data in the database
    val updateRunning = writeDB(
      s"""
         |UPDATE ${schemaName}.run
         |SET is_checked = ?, response = ?, submitTime = ?
         |WHERE run_id = ?
       """.stripMargin,
      List(
        SqlParameter("Int", is_checked.toString),
        SqlParameter("String", response),
        SqlParameter("Datetime", submitTime.getTime.toString),
        SqlParameter("Int", run_id.toString)
      )
    )

    updateRunning.map { _ =>
      "Running data checked successfully!"
    }
  }
}