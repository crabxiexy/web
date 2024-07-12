package Impl

import cats.effect.IO
import Common.API.{PlanContext, Planner}
import Common.DBAPI._
import Common.Object.SqlParameter
import Common.ServiceUtils.schemaName
import io.circe.Json
import io.circe.generic.auto._



case class TAQueryPlanner(
                           TA_id: Int,
                           override val planContext: PlanContext
                         ) extends Planner[List[Json]] {

  override def plan(using planContext: PlanContext): IO[List[Json]] = {
    // Construct the SQL query to fetch all fields
    val sqlQuery =
      s"""
         |SELECT groupex_id, ex_name,startTime, finishTime, location, status, token
         |FROM groupex.groupex
         |WHERE TA_id = ?
       """.stripMargin

    // Execute the query using readDBRows
    readDBRows(sqlQuery, List(SqlParameter("Int", TA_id.toString)))
  }
}
