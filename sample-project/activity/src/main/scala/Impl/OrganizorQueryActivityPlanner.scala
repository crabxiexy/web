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

case class OrganizorQueryActivityPlanner(organizor_id: Int, override val planContext: PlanContext) extends Planner[List[Json]] {
  override def plan(using planContext: PlanContext): IO[List[Json]] = {
    val sqlQuery =
      s"""
         |SELECT activity_id, club_name, activity_name, intro, startTime, finishTime, organizor_id, lowLimit, upLimit, num
         |FROM ${schemaName}.activity
         |WHERE organizor_id = ?
             """.stripMargin
    val parameters = List(SqlParameter("Int", organizor_id.toString))
    readDBRows(sqlQuery, parameters)
  }
}
