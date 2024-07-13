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

case class QueryMemberPlanner(club_name: String, override val planContext: PlanContext) extends Planner[List[Json]] {
  override def plan(using planContext: PlanContext): IO[List[Json]] = {
    val sqlQuery =
      s"""
         |SELECT member_name
         |FROM ${schemaName}.member
         |WHERE club_name = ?
       """.stripMargin

    // Execute the query using readDBRows
    readDBRows(sqlQuery, List(SqlParameter("String", club_name)))
  }
}