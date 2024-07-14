package Impl

import java.sql.Timestamp
import java.util.Date
import Common.API.{PlanContext, Planner}
import Common.DBAPI._
import Common.Object.SqlParameter
import Common.ServiceUtils.schemaName
import cats.effect.IO
import io.circe.generic.auto._

case class DeleteNotificationPlanner(
                                      notificationId: Int,
                                      override val planContext: PlanContext
                                    ) extends Planner[String] {

  override def plan(using planContext: PlanContext): IO[String] = {
    val deleteNotification = writeDB(
      s"DELETE FROM ${schemaName}.notification WHERE notification_id = ?",
      List(SqlParameter("Int", notificationId.toString))
    )

    deleteNotification.map { _ =>
      "Notification deleted successfully!"
    }
  }
}