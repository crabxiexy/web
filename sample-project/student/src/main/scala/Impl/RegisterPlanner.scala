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

case class RegisterPlanner(student_id: Int, override val planContext: PlanContext) extends Planner[String] {
  override def plan(using planContext: PlanContext): IO[String] = {
    val insertIdentity = writeDB(
      s"""
         INSERT INTO student.student (student_id) VALUES(?)
    """.stripMargin,
      List(
        SqlParameter("Int", student_id.toString),
      )
    )
    insertIdentity
  }
}