package Impl

import Common.API.{PlanContext, Planner}
import Common.DBAPI.readDBRows
import Common.Object.SqlParameter
import Common.ServiceUtils.schemaName
import cats.effect.IO
import io.circe.Json
import io.circe.generic.auto._
import Common.Model.Student

case class FetchStudentInfoPlanner(studentId: Int, override val planContext: PlanContext) extends Planner[List[Json]]{

  override def plan(using planContext: PlanContext): IO[List[Json]]={
    val sqlQuery =
      s"""
         |SELECT student_id, name, profile, TA_id, score, department, class_name
         |FROM ${schemaName}.student
         |WHERE student_id = ?
       """.stripMargin

    readDBRows(sqlQuery, List(SqlParameter("Int", studentId.toString)))
  }
}