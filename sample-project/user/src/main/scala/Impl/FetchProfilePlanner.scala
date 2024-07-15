package Impl

import cats.effect.IO
import Common.API.{PlanContext, Planner}
import Common.DBAPI.{readDBRows, *}
import Common.Object.SqlParameter
import Common.ServiceUtils.schemaName
import java.sql.Timestamp
import java.time.Instant
import io.circe.Json
import io.circe.generic.auto._
import Common.API.{PlanContext, Planner}
import Common.Object.{ParameterList, SqlParameter}

case class FetchProfilePlanner(studentId: Int, override val planContext: PlanContext) extends Planner[String] {
  override def plan(using planContext: PlanContext): IO[String] = {
    // SQL query to fetch the profile based on student_id
    val query = s"""
      SELECT profile
      FROM ${schemaName}.profiles
      WHERE student_id = ?
    """

    readDBRows(
      query,
      List(SqlParameter("Int", studentId.toString))
    ).flatMap {
      case Nil => IO.raiseError(new Exception("Profile not found for the given student ID"))
      case row :: _ =>
        row.asObject.flatMap(_.apply("profile").flatMap(_.asString)) match {
          case Some(profile) => IO.pure(profile) // Return the profile string
          case None => IO.raiseError(new Exception("Profile format is invalid"))
        }
    }
  }
}
