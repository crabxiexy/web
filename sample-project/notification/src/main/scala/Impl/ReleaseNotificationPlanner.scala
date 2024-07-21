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
                                       senderId: Int,
                                       receiverId: Int,
                                       content: String
                                     ) extends Planner[Unit] {

  override def plan(using planContext: PlanContext): IO[Unit] = {
    // 使用单个查询生成 notification_id 并插入通知
    val query =
      s"""
         |WITH new_id AS (
         |  SELECT COALESCE(MAX(notification_id), 0) + 1 AS notification_id
         |  FROM ${schemaName}.${schemaName}
         |)
         |INSERT INTO ${schemaName}.${schemaName} (notification_id,release_time, content, sender_id, receiver_id, checked)
         |SELECT new_id.notification_id, NOW(), ?, ?, ?, 0
         |FROM new_id
       """.stripMargin

    for {
      _ <- writeDB(query, List(
        SqlParameter("String", content),
        SqlParameter("Int", senderId.toString),
        SqlParameter("Int", receiverId.toString)
      ))
    } yield ()
  }
}
