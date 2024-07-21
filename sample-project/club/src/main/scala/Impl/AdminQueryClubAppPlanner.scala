package Impl

import Common.API.{PlanContext, Planner}
import Common.DBAPI.{readDBRows, *}
import Common.Object.SqlParameter
import Common.ServiceUtils.schemaName
import cats.effect.IO
import io.circe.Json
import io.circe.generic.auto._
import Common.Model.{Student, ClubApplication}
import APIs.StudentAPI.FetchStudentInfoMessage
import cats.implicits.toTraverseOps

case class AdminQueryClubAppPlanner(is_checked: Int, override val planContext: PlanContext) extends Planner[List[ClubApplication]] {
  override def plan(using planContext: PlanContext): IO[List[ClubApplication]] = {
    val sqlQuery =
      s"""
         |SELECT name, leader, intro, department, is_checked, result, response
         |FROM ${schemaName}.application
         |WHERE is_checked = ?
       """.stripMargin

    readDBRows(sqlQuery, List(SqlParameter("Int", is_checked.toString))).flatMap { rows =>
      rows.traverse { json =>
        val name = json.hcursor.downField("name").as[String].getOrElse("")
        val leaderId = json.hcursor.downField("leader").as[Int].getOrElse(0)
        val intro = json.hcursor.downField("intro").as[String].getOrElse("")
        val department = json.hcursor.downField("department").as[String].getOrElse("")
        val isChecked = json.hcursor.downField("isChecked").as[Int].getOrElse(0)
        val result = json.hcursor.downField("result").as[Int].getOrElse(0)
        val response = json.hcursor.downField("response").as[String].getOrElse("")

        FetchStudentInfoMessage(leaderId).send.map { leader =>
          ClubApplication(name, leader, intro, department, isChecked, result, response)
        }
      }
    }
  }
}