package Impl

import cats.effect.IO
import Common.API.{PlanContext, Planner}
import Common.DBAPI._
import Common.Object.SqlParameter
import Common.ServiceUtils.schemaName
import io.circe.Json
import io.circe.parser._
import io.circe.generic.auto._

case class StudentQueryPlanner(student_id: Int, override val planContext: PlanContext) extends Planner[List[Json]] {
  override def plan(using planContext: PlanContext): IO[List[Json]] = {
    // Construct the SQL query with schemaName to fetch all fields
    val sqlQuery =
      s"""
      |SELECT HW_id, startTime, finishTime, submitTime, HW_name, student_id, leader_id, TA_id, club_name, imgUrl, is_checked, response
      |FROM ${schemaName}.HW
      |WHERE student_id = ?
       """.stripMargin
    // Execute the query using readDBRows
    readDBRows(sqlQuery, List(SqlParameter("Int", student_id.toString)))
  }
}