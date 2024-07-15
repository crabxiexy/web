package Impl

import Common.API.{PlanContext, Planner}
import Common.DBAPI.readDBRows
import Common.Object.SqlParameter
import Common.ServiceUtils.schemaName
import cats.effect.IO
import io.circe.Json
import io.circe.generic.auto.*

case class StudentQueryApplytoTeamPlanner(studentId: Int, override val planContext: PlanContext) extends Planner[List[Json]] {
  override def plan(using planContext: PlanContext): IO[List[Json]] = {
    val sqlQuery =
      s"""
         |SELECT *
         |FROM ${schemaName}.student_application
         |WHERE student_id = ?
       """.stripMargin

    readDBRows(sqlQuery, List(SqlParameter("Int", studentId.toString)))
  }
}
//学生查询加入俱乐部的申请