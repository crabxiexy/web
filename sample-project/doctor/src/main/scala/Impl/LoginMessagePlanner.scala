package Impl

import cats.effect.IO
import io.circe.Json
import io.circe.generic.auto.*
import Common.API.{PlanContext, Planner}
import Common.DBAPI.{writeDB, *}
import Common.Object.{ParameterList, SqlParameter}
import Common.ServiceUtils.schemaName
import APIs.PatientAPI.PatientQueryMessage
import cats.effect.IO
import io.circe.generic.auto.*


case class LoginMessagePlanner(student_id:Int, password: String, identity:Int, override val planContext: PlanContext) extends Planner[String]:
  override def plan(using PlanContext): IO[String] = {
    // Attempt to validate the user by reading the rows from the database
    readDBRows(
      s"SELECT student_id FROM ${schemaName}.user WHERE student_id = ? AND password = ? AND identity = ?",
      List(SqlParameter("Int", student_id.toString), SqlParameter("String", password), SqlParameter("Int", identity.toString))
    ).map{
      case Nil => "Invalid user"
      case _ => "Valid user"
    }
  }
