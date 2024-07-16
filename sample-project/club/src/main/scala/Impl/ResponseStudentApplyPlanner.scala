package Impl
import Common.API.{PlanContext, Planner}
import Common.DBAPI.{writeDB, *}
import Common.Object.{ParameterList, SqlParameter}
import Common.ServiceUtils.schemaName
import cats.effect.IO
import io.circe.Json
import io.circe.generic.auto.*

import java.security.MessageDigest
import java.util.Base64
case class ResponseStudentApplyPlanner(studentId: Int, clubName: String, result: Int, override val planContext: PlanContext) extends Planner[Unit] {
  override def plan(using planContext: PlanContext): IO[Unit] = {
    val sqlUpdate =
      s"""
         |UPDATE ${schemaName}.student_application
         |SET result = ?, is_checked = 1
         |WHERE student_id = ? AND club_name = ?
       """.stripMargin

    writeDB(sqlUpdate, List(
      SqlParameter("Int", result.toString),
      SqlParameter("Int", studentId.toString),
      SqlParameter("String", clubName)
    )).map(_ => ()) // Return unit after the update
  }
}