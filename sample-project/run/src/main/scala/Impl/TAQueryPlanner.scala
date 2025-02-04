package Impl

import cats.effect.IO
import Common.API.{PlanContext, Planner}
import Common.DBAPI._
import Common.Object.SqlParameter
import Common.ServiceUtils.schemaName
import io.circe.Json
import io.circe.parser._
import io.circe.generic.auto._

case class TAQueryPlanner(
                           ta_id: Int,
                           override val planContext: PlanContext
                         ) extends Planner[List[Json]] {

  override def plan(using planContext: PlanContext): IO[List[Json]] = {
    // Construct the SQL query with schemaName to fetch all fields
    val sqlQuery =
      s"""
         |SELECT run_id, student_id,  ta_id, startTime, finishTime, submitTime, distance, imgUrl, is_checked, response
         |FROM ${schemaName}.run
         |WHERE ta_id = ? AND is_checked = 0
       """.stripMargin

    // Execute the query using readDBRows
    readDBRows(sqlQuery, List(SqlParameter("Int", ta_id.toString)))
  }
}