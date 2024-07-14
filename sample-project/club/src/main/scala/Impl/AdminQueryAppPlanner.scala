package Impl


import Common.API.{PlanContext, Planner}
import Common.DBAPI.{writeDB, *}
import Common.Object.{ParameterList, SqlParameter}
import Common.ServiceUtils.schemaName
import cats.effect.IO
import io.circe.Json
import io.circe.generic.auto.*

import java.security.MessageDigest
import java.util.Base64

case class AdminQueryAppPlanner(is_checked: Boolean, override val planContext: PlanContext) extends Planner[List[Json]] {
  override def plan(using planContext: PlanContext): IO[List[Json]] = {
    val sqlQuery =
      s"""
         |SELECT name, leader, intro, department
         |FROM ${schemaName}.application
         |WHERE is_checked = ?
       """.stripMargin
    readDBRows(sqlQuery, List(SqlParameter("Boolean", is_checked.toString)))
  }
}