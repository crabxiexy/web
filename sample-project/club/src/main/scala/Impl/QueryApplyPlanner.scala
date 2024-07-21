package Impl

import cats.syntax.all.toTraverseOps
import Common.API.{PlanContext, Planner}
import Common.DBAPI.{readDBRows, *}
import Common.Object.SqlParameter
import Common.ServiceUtils.schemaName
import cats.effect.IO
import io.circe.Json
import io.circe.generic.auto._
import Common.Model.{Student, StudentApplication}
import APIs.StudentAPI.FetchStudentInfoMessage

case class QueryApplyPlanner(clubName: String, override val planContext: PlanContext) extends Planner[List[StudentApplication]] {
  override def plan(using planContext: PlanContext): IO[List[StudentApplication]] = {
    val sqlQuery =
      s"""
         |SELECT student_id, club_name, is_checked, result
         |FROM ${schemaName}.student_application
         |WHERE club_name = ? AND is_checked = 0
       """.stripMargin

    readDBRows(sqlQuery, List(SqlParameter("String", clubName))).flatMap { rows =>
      rows.traverse { json =>
        val studentId = json.hcursor.downField("studentID").as[Int].getOrElse(0)
        val clubName = json.hcursor.downField("clubName").as[String].getOrElse("")
        val isChecked = json.hcursor.downField("isChecked").as[Int].getOrElse(0)
        val result = json.hcursor.downField("result").as[Int].getOrElse(0)

        FetchStudentInfoMessage(studentId).send.map { student =>
          StudentApplication(student, clubName, isChecked, result)
        }
      }
    }
  }
}