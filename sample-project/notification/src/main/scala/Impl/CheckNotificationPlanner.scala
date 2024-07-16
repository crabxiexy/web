package Impl

import java.sql.Timestamp
import java.util.Date
import Common.API.{PlanContext, Planner}
import Common.DBAPI._
import Common.Object.SqlParameter
import Common.ServiceUtils.schemaName
import cats.effect.IO
import io.circe.generic.auto._
case class CheckNotificationPlanner(notificationId: Int) extends Planner[Unit] {

  override def plan(using planContext: PlanContext): IO[Unit] = {
    // Step 1: Update the notification's checked status
    val updateQuery =
      s"""
         |UPDATE ${schemaName}.${schemaName}
         |SET checked = 1
         |WHERE notification_id = ?
       """.stripMargin

    for {
      _ <- writeDB(updateQuery, List(
        SqlParameter("Int", notificationId.toString)
      ))
    } yield ()
  }
}