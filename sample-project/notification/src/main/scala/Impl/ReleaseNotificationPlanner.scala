package Impl

import java.sql.Timestamp
import java.util.Date
import Common.API.{PlanContext, Planner}
import Common.DBAPI._
import Common.Object.SqlParameter
import Common.ServiceUtils.schemaName
import cats.effect.IO
import io.circe.generic.auto._

case class ReleaseNotificationPlanner(
                                       releaserName: String,
                                       releaseTime: String,
                                       content: String,
                                       override val planContext: PlanContext
                                     ) extends Planner[String] {

  override def plan(using planContext: PlanContext): IO[String] = {

    // Insert the release notification data into the database
    val submitNotification = writeDB(
      s"""
         |WITH new_id AS (
         |  SELECT COALESCE(MAX(notification_id), 0) + 1 AS notification_id FROM notification.notification
         |)
         |INSERT INTO ${schemaName}.notification (notification_id, releaser_name, release_time, content)
         |SELECT new_id.notification_id, ?, ?, ?
         |FROM new_id
       """.stripMargin,
      List(
        SqlParameter("String", releaserName),
        SqlParameter("Datetime", releaseTime),
        SqlParameter("String", content)
      )
    )

    // Return the result of the database insertion
    submitNotification.map { _ =>
      "Notification released successfully!"
    }
  }
}