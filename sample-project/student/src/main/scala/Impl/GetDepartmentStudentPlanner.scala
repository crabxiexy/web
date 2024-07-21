package Impl

import APIs.PatientAPI.PatientQueryMessage
import Common.API.{PlanContext, Planner}
import Common.DBAPI.{writeDB, *}
import Common.Object.{ParameterList, SqlParameter}
import Common.ServiceUtils.schemaName
import cats.effect.IO
import io.circe.Json
import io.circe.generic.auto.*

import java.security.MessageDigest
import java.util.Base64

case class GetDepartmentStudentPlanner(department:String, override val planContext: PlanContext) extends Planner[List[Json]] {
  override def plan(using planContext: PlanContext): IO[List[Json]] = {
    // Construct the SQL query to fetch all fields where TA_id is NULL
    val sqlQuery =
      s"""
         |SELECT student_id, TA_id, score, department, class_name
         |FROM ${schemaName}.student
         |WHERE department = ?
       """.stripMargin

    // Execute the query using readDBRows
    readDBRows(sqlQuery, List(SqlParameter("String", department)))
  }
}