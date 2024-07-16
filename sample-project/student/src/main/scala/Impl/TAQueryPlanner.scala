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
case class TAQueryPlanner(
                           TA_id: Int,
                           override val planContext: PlanContext
                         ) extends Planner[List[Json]] {

  override def plan(using planContext: PlanContext): IO[List[Json]] = {
    // Construct the SQL query to fetch all fields related to the TA
    val sqlQuery =
      s"""
         |SELECT student_id, score, department, class
         |FROM ${schemaName}.student
         |WHERE TA_id = ?
       """.stripMargin

    // Execute the query using readDBRows
    readDBRows(sqlQuery, List(SqlParameter("Int", TA_id.toString)))
  }
}