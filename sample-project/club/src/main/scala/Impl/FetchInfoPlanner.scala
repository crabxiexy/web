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
case class FetchInfoPlanner(clubName: String, override val planContext: PlanContext) extends Planner[List[Json]] {
  override def plan(using planContext: PlanContext): IO[List[Json]] = {
    // Step 1: Query the info table for the specified clubName
    val infoQuery =
      s"""
         |SELECT *
         |FROM ${schemaName}.info
         |WHERE name = ?
       """.stripMargin

    // Step 2: Execute the query and return the results
    for {
      clubInfoResults <- readDBRows(infoQuery, List(SqlParameter("String", clubName)))
    } yield clubInfoResults
  }
}