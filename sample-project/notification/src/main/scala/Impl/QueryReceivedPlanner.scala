package Impl

import cats.effect.IO
import Common.API.{PlanContext, Planner}
import Common.DBAPI.*
import Common.Object.SqlParameter
import Common.ServiceUtils.schemaName
import io.circe.Json
import io.circe.parser.*
import io.circe.generic.auto.*
import Common.Model.{Notification, Student}
import APIs.StudentAPI.FetchStudentInfoMessage
import cats.implicits.*

import java.time.OffsetDateTime

case class QueryReceivedPlanner(receiverId: Int) extends Planner[List[Notification]] {
  override def plan(using planContext: PlanContext): IO[List[Notification]] = {
    val query =
      s"""
         |SELECT notification_id, release_time, content, sender_id, receiver_id, checked
         |FROM ${schemaName}.notification
         |WHERE receiver_id = ?
       """.stripMargin

    readDBRows(query, List(SqlParameter("Int", receiverId.toString))).flatMap { rows =>
      rows.traverse { json =>
        val notificationID = json.hcursor.downField("notificationID").as[Int].getOrElse(0)
        val releaseTime = json.hcursor.downField("releaseTime").as[String].getOrElse("")
        val content = json.hcursor.downField("content").as[String].getOrElse("")
        val senderID = json.hcursor.downField("senderID").as[Int].getOrElse(0)
        val receiverID = json.hcursor.downField("receiverID").as[Int].getOrElse(0)
        val checked = json.hcursor.downField("checked").as[Int].getOrElse(0)

        // Fetch sender and receiver info
        val fetchSenderInfo = FetchStudentInfoMessage(senderID).send
        val fetchReceiverInfo = FetchStudentInfoMessage(receiverID).send

        for {
          sender <- fetchSenderInfo
          receiver <- fetchReceiverInfo
        } yield {
          Notification(
            notificationID = notificationID,
            releaseTime = releaseTime,
            content = content,
            sender = sender,
            receiver = receiver,
            checked = checked
          )
        }
      }
    }
  }
}