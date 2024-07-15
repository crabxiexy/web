package Impl
import APIs.PatientAPI.PatientQueryMessage
import Common.API.{PlanContext, Planner}
import Common.DBAPI.{writeDB, *}
import Common.Object.{ParameterList, SqlParameter}
import Common.ServiceUtils.schemaName
import cats.effect.IO
import io.circe.Json
import io.circe.generic.auto.*

import java.security.MessageDigest
import java.util.Base64

case class QueryDepartmentPlanner(studentId: Int, override val planContext: PlanContext) extends Planner[Option[String]] {
  override def plan(using planContext: PlanContext): IO[Option[String]] = {
    val sqlQuery =
      s"""
         |SELECT department
         |FROM ${schemaName}.student
         |WHERE student_id = ?
       """.stripMargin

    readDBString(sqlQuery, List(SqlParameter("Int", studentId.toString))).map { result =>
      Option(result).filter(_.nonEmpty) // Return Some(name) if not empty, otherwise None
    }
  }
}