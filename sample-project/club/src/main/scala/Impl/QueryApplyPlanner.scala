package Impl

import Common.API.{PlanContext, Planner}
import Common.DBAPI.{readDBRows, *}
import Common.Object.SqlParameter
import Common.ServiceUtils.schemaName
import cats.effect.IO
import io.circe.Json
import io.circe.generic.auto.*

case class QueryApplyPlanner(clubName: String, override val planContext: PlanContext) extends Planner[List[Json]] {
  override def plan(using planContext: PlanContext): IO[List[Json]] = {
    val sqlQuery =
      s"""
         |SELECT student_id, club_name, is_checked, result
         |FROM ${schemaName}.student_application
         |WHERE club_name = ? AND is_checked = 0
       """.stripMargin
    readDBRows(sqlQuery, List(SqlParameter("String", clubName)))
  }
}
//队长查看入队申请