package Impl

import cats.effect.IO
import Common.API.{PlanContext, Planner}
import Common.DBAPI._
import Common.Object.SqlParameter
import io.circe.Json
import io.circe.generic.auto._
import cats.Traverse._
import io.circe.parser._
import cats.syntax.traverse._

case class TAQueryHWPlanner(
                                      TA_id: Int,
                                      override val planContext: PlanContext
                                    ) extends Planner[List[Json]] {

  override def plan(using planContext: PlanContext): IO[List[Json]] = {

        val sqlQuery =
          s"""
             |SELECT activity_id, student_id, TA_id, submitTime, imgUrl
             |FROM activity.HW
             |WHERE TA_id = ? AND is_checked = 0
       """.stripMargin

    readDBRows(sqlQuery, List(
          SqlParameter("Int", TA_id.toString),
        )).flatMap { rows =>
          rows.toList.traverse { row =>
            for {
              //先把第一步查询的内容留下来
              aid <- IO.fromOption(row.hcursor.get[Int]("activityID").toOption)(new Exception("activity_id not found"))
              sid <- IO.fromOption(row.hcursor.get[Int]("studentID").toOption)(new Exception("student_id not found"))
              submitTime <- IO.fromOption(row.hcursor.get[String]("submittime").toOption)(new Exception("submitTime not found"))
              imgUrl <- IO.fromOption(row.hcursor.get[String]("imgurl").toOption)(new Exception("imgUrl not found"))
              club_name <- readDBString(s"SELECT club_name FROM activity.activity WHERE activity_id = ?",List(SqlParameter("Int", aid.toString)))
              activity_name <- readDBString(s"SELECT activity_name FROM activity.activity WHERE activity_id = ?",List(SqlParameter("Int", aid.toString)))
              intro <- readDBString(s"SELECT intro FROM activity.activity WHERE activity_id = ?",List(SqlParameter("Int", aid.toString)))
              startTime <- readDBString(s"SELECT startTime FROM activity.activity WHERE activity_id = ?",List(SqlParameter("Int", aid.toString)))
              finishTime <- readDBString(s"SELECT finishTime FROM activity.activity WHERE activity_id = ?",List(SqlParameter("Int", aid.toString)))
              organizor_id <- readDBInt(s"SELECT organizor_id FROM activity.activity WHERE activity_id = ?",List(SqlParameter("Int", aid.toString)))
            } yield {
              Json.obj(
                "activity_id" -> Json.fromInt(aid),
                "student_id"-> Json.fromInt(sid),
                "submitTime" -> Json.fromString(submitTime),
                "imgUrl" -> Json.fromString(imgUrl),
                "club_name" -> Json.fromString(club_name),
                "activity_name" -> Json.fromString(activity_name),
                "intro" -> Json.fromString(intro),
                "startTime" -> Json.fromString(startTime),
                "finishTime" -> Json.fromString(finishTime),
                "organizor_id" -> Json.fromInt(organizor_id),
              )
            }
          }
        }
      }
}
