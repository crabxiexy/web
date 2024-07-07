package Impl

import java.security.MessageDigest
import java.util.Base64
import cats.effect.IO
import io.circe.generic.auto.*
import Common.API.{PlanContext, Planner}
import Common.DBAPI.*
import Common.Object.{ParameterList, SqlParameter}
import Common.ServiceUtils.schemaName
import APIs.UserAPI.UserInfo
import APIs.PatientAPI.PatientQueryMessage
import cats.effect.IO
import io.circe.generic.auto.*

case class QueryMessagePlanner(student_id: Int, override val planContext: PlanContext) extends Planner[UserInfo]:
  override def plan(using planContext: PlanContext): IO[UserInfo] = {
    val query = s"SELECT student_id, name, identity FROM ${schemaName}.user WHERE student_id = ?"
    val parameters = List(SqlParameter("Int", student_id.toString))

    readDBRows(query, parameters).flatMap { rows =>
      rows.headOption match {
        case Some(row) =>
          val studentId = row.hcursor.get[Int]("student_id").getOrElse(throw new Exception("student_id not found"))
          val userName = row.hcursor.get[String]("name").getOrElse(throw new Exception("name not found"))
          val identity = row.hcursor.get[Int]("identity").getOrElse(throw new Exception("identity not found"))
          IO.pure(UserInfo(studentId, userName, identity))
        case None =>
          IO.raiseError(new Exception("Student not found"))
      }
    }
  }