package Impl

import cats.effect.IO
import Common.API.{PlanContext, Planner}
import Common.DBAPI._
import Common.Object.SqlParameter
import Common.ServiceUtils.schemaName
import io.circe.Json
import io.circe.generic.auto._

case class CountRunPlanner(student_id: Int, override val planContext: PlanContext) extends Planner[Int] {
  override def plan(using planContext: PlanContext): IO[Int] = {
    // Construct the SQL query to count runs with is_checked = 1
    val sqlQuery =
      s"""
         |SELECT COUNT(*) AS run_count
         |FROM ${schemaName}.run
         |WHERE student_id = ? AND is_checked = 1
       """.stripMargin
    readDBInt(sqlQuery, List(SqlParameter("Int", student_id.toString)))
  }
}

