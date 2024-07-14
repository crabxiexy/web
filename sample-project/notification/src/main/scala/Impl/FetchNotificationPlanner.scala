package Impl

import cats.effect.IO
import Common.API.{PlanContext, Planner}
import Common.DBAPI._
import Common.Object.SqlParameter
import Common.ServiceUtils.schemaName
import io.circe.Json
import io.circe.parser._
import io.circe.generic.auto._


case class FetchNotificationPlanner(
                                     override val planContext: PlanContext
                                   ) extends Planner[List[Json]] {

  override def plan(using planContext: PlanContext): IO[List[Json]] = {
    // Construct the SQL query with schemaName to fetch all fields from notifications table
    val sqlQuery =
      s"""
         |SELECT notification_id, releaser_name, release_time, content
         |FROM ${schemaName}.notifications
       """.stripMargin

    // Use ReadDBRows to fetch all notifications from the database
    readDBRows(sqlQuery, List())
  }
}