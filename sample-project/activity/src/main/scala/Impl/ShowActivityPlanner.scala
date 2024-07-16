package Impl

import APIs.PatientAPI.PatientQueryMessage
import Common.API.{PlanContext, Planner}
import Common.DBAPI.{readDBBoolean, readDBRows, writeDB}
import Common.Object.{ParameterList, SqlParameter}
import Common.ServiceUtils.schemaName
import cats.effect.IO
import io.circe.Json
import io.circe.generic.auto.*

import java.security.MessageDigest
import java.util.Base64

case class ShowActivityPlanner(
                                club_name: String,
                                override val planContext: PlanContext
                              ) extends Planner[List[Json]] {

  override def plan(using planContext: PlanContext): IO[List[Json]] = {
    // SQL query to retrieve all activities for the specified club_name
    val sqlQuery =
      s"""
         |SELECT a.activity_id, a.club_name, a.activity_name, a.intro, a.startTime, a.finishTime, a.organizor_id, a.lowLimit, a.upLimit, a.num
         |FROM ${schemaName}.activity a
         |WHERE a.club_name = ?
         """.stripMargin

    // Prepare parameters for the query
    val parameters = List(SqlParameter("String", club_name))

    // Execute the query and return the results
    readDBRows(sqlQuery, parameters)
  }
}