package Impl

import Common.API.{PlanContext, Planner}
import Common.DBAPI.readDBRows
import Common.Object.SqlParameter
import Common.ServiceUtils.schemaName
import cats.effect.IO
import io.circe.Json
import io.circe.generic.auto._
import Common.Model.Student

case class FetchStudentInfoPlanner(student_id: Int, override val planContext: PlanContext) extends Planner[Option[Student]] {

  override def plan(using planContext: PlanContext): IO[Option[Student]] = {
    val sqlQuery =
      s"""
         |SELECT student_id, name, profile, TA_id, score, department, class_name
         |FROM ${schemaName}.student
         |WHERE student_id = ?
       """.stripMargin

    readDBRows(sqlQuery, List(SqlParameter("Int", student_id.toString)))
      .map { rows =>
        rows.headOption.flatMap { json =>
          // Attempt to decode JSON into Student
          json.as[Student].toOption
        }
      }
  }
}
