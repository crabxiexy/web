package Impl

import Common.API.{PlanContext, Planner}
import Common.DBAPI.{writeDB, *}
import Common.Object.{ParameterList, SqlParameter}
import Common.ServiceUtils.schemaName
import cats.effect.IO
import io.circe.generic.auto.*


case class ApplyMemberPlanner(studentId: Int, clubName: String, override val planContext: PlanContext) extends Planner[Unit] {
  override def plan(using planContext: PlanContext): IO[Unit] = {
    val sqlInsert =
      s"""
         |INSERT INTO ${schemaName}.student_application (student_id, club_name, is_checked, result)
         |VALUES (?, ?, 0, 0)
       """.stripMargin

    writeDB(sqlInsert, List(
      SqlParameter("Int", studentId.toString),
      SqlParameter("String", clubName)
    )).map(_ => ()) // 忽略返回值并返回 Unit
  }
}
//学生入队申请