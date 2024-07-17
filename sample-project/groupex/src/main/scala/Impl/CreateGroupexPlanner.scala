package Impl

import cats.effect.IO
import io.circe.generic.auto.*
import Common.API.{PlanContext, Planner}
import Common.DBAPI.*
import Common.Object.SqlParameter

case class CreateGroupexPlanner(
                                 ex_name: String,
                                 TA_id: Int,
                                 startTime: String,
                                 finishTime: String,
                                 location: String,
                                 override val planContext: PlanContext
                               ) extends Planner[String] {
  override def plan(using planContext: PlanContext): IO[String] = {
    // Insert a new group exercise record directly
    val insertGroupExercise = writeDB(
      s"""
         |WITH new_id AS (
         |  SELECT COALESCE(MAX(groupex_id), 0) + 1 AS next_id FROM groupex.groupex
         |)
         |INSERT INTO groupex.groupex (groupex_id, ex_name, TA_id, startTime, finishTime, location, status, token)
         |SELECT new_id.next_id, ?, ?, ?, ?, ?, ?, ?
         |FROM new_id
       """.stripMargin,
      List(
        SqlParameter("String", ex_name),
        SqlParameter("Int", TA_id.toString),
        SqlParameter("Datetime", startTime),
        SqlParameter("Datetime", finishTime),
        SqlParameter("String", location),
        SqlParameter("Int", 0.toString), // status
        SqlParameter("String", "") // token
      )
    )

    insertGroupExercise.map { _ =>
      "Group exercise created successfully." // Return a simple success message
    }
  }
}
