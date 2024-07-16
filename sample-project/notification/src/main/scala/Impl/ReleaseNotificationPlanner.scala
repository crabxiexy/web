package Impl

import cats.effect.IO
import Common.API.{PlanContext, Planner}
import Common.DBAPI._
import Common.Object.SqlParameter
import Common.ServiceUtils.schemaName
import io.circe.Json
import io.circe.parser._
import io.circe.generic.auto._

case class ReleaseNotificationPlanner(
                                       releaserName: String,
                                       senderId: Int,
                                       receiverId: Int,
                                       content: String // Assuming content is provided for the notification
                                     ) extends Planner[Unit] {

  override def plan(using planContext: PlanContext): IO[Unit] = {
    // Step 1: Generate a notification_id
    val notificationIdQuery =
      s"""
         |SELECT COALESCE(MAX(notification_id), 0) + 1 AS next_id
         |FROM ${schemaName}.${schemaName}
       """.stripMargin

    for {
      notificationIdResult <- readDBRows(notificationIdQuery, List())
      notificationId = notificationIdResult.headOption.flatMap(_.asObject.flatMap(_.apply("next_id").flatMap(_.asNumber).map(_.toInt))).getOrElse(1)

      // Step 2: Insert the notification into the database
      insertQuery =
        s"""
           |INSERT INTO ${schemaName}.${schemaName} (notification_id, releaser_name, release_time, content, sender_id, receiver_id, checked)
           |VALUES (?, ?, NOW(), ?, ?, ?, 0)
         """.stripMargin

      _ <- writeDB(insertQuery, List(
        SqlParameter("Int", notificationId.toString),
        SqlParameter("String", releaserName),
        SqlParameter("String", content),
        SqlParameter("Int", senderId.toString),
        SqlParameter("Int", receiverId.toString)
      ))

    } yield ()
  }
}