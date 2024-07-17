package Impl

import Common.API.{PlanContext, Planner}
import Common.DBAPI.readDBInt
import Common.Object.SqlParameter
import Common.ServiceUtils.schemaName
import cats.effect.IO

case class CountHWPlanner(
                           student_id: Int,
                           override val planContext: PlanContext
                         ) extends Planner[Int] {

  override def plan(using planContext: PlanContext): IO[Int] = {
    val countQuery =
      s"""
         |SELECT COUNT(*)
         |FROM ${schemaName}.HW
         |WHERE student_id = ? AND is_checked = 1
       """.stripMargin

    readDBInt(countQuery, List(SqlParameter("Int", student_id.toString)))
  }
}
