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

case class GetTAPlanner(student_id: Int, override val planContext: PlanContext) extends Planner[Int] {
  override def plan(using planContext: PlanContext): IO[Int] = {
    val get_ta = readDBInt(
      s"""
         |SELECT ta_id
         |FROM student.student
         |WHERE student_id = ?
       """.stripMargin,
      List(SqlParameter("Int", student_id.toString))
    )
    get_ta
  }
}
