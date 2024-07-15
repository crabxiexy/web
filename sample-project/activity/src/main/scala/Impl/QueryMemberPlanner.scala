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

case class QueryMemberPlanner(activity_id:Int, override val planContext: PlanContext) extends Planner[List[Json]] {
  override def plan(using planContext: PlanContext): IO[List[Json]] = {
    //认为是先query activity再query member,遂还是没有鉴权
    val sqlQuery =
      s"""
         |SELECT member_id
         |FROM ${schemaName}.activity
         |WHERE activity_id = ?
             """.stripMargin
    val parameters = List(SqlParameter("Int", activity_id.toString))
    readDBRows(sqlQuery, parameters)
  }
}
