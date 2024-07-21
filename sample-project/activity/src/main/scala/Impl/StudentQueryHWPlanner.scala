package Impl

import Common.API.{PlanContext, Planner}
import Common.DBAPI.*
import Common.Object.SqlParameter
import Common.ServiceUtils.schemaName
import cats.effect.IO
import io.circe.Json
import io.circe.generic.auto.*
import io.circe.parser.*

case class StudentQueryHWPlanner(student_id: Int, override val planContext: PlanContext) extends Planner[List[Json]] {
  override def plan(using planContext: PlanContext): IO[List[Json]] = {
    // Construct the SQL query with schemaName to fetch all fields
    val sqlQuery =
      s"""
      |SELECT activity_id , submitTime , imgUrl , is_checked , response
      |FROM ${schemaName}.HW
      |WHERE student_id = ?
       """.stripMargin
    // Execute the query using readDBRows
    readDBRows(sqlQuery, List(SqlParameter("Int", student_id.toString)))
  }
}