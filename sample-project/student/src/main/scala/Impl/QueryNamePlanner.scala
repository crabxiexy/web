package Impl

import APIs.PatientAPI.PatientQueryMessage
import Common.API.{PlanContext, Planner}
import Common.DBAPI.{writeDB, *}
import Common.Object.{ParameterList, SqlParameter}
import Common.ServiceUtils.schemaName
import cats.effect.IO
import io.circe.Json
import io.circe.generic.auto.*

case class QueryNamePlanner(studentId: Int, override val planContext: PlanContext) extends Planner[Option[String]] {
  override def plan(using planContext: PlanContext): IO[Option[String]] = {
    val sqlQuery =
      s"""
         |SELECT name
         |FROM "doctor"."user"
         |WHERE student_id = ?
       """.stripMargin

    readDBString(sqlQuery, List(SqlParameter("Int", studentId.toString))).map { result =>
      if (result.nonEmpty) Some(result) else None // Return Some(name) if not empty, otherwise None
    }
  }
}