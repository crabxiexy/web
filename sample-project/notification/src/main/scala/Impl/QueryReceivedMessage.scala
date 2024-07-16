package Impl

import cats.effect.IO
import Common.API.{PlanContext, Planner}
import Common.DBAPI._
import Common.Object.SqlParameter
import Common.ServiceUtils.schemaName
import io.circe.Json
import io.circe.parser._
import io.circe.generic.auto._

case class QueryReceivedPlanner(receiverId: Int) extends Planner[List[Json]] {
  override def plan(using planContext: PlanContext): IO[List[Json]] = {
    val query =
      s"""
         |SELECT *
         |FROM ${schemaName}.${schemaName}
         |WHERE receiver_id = ?
       """.stripMargin

    readDBRows(query, List(SqlParameter("Int", receiverId.toString)))
  }
}