package Impl

import cats.effect.IO
import Common.API.{PlanContext, Planner}
import Common.DBAPI.{readDBRows, *}
import Common.Object.SqlParameter
import Common.ServiceUtils.schemaName
import Common.Model.UserInfo
import io.circe.parser._
import io.circe.syntax._
import io.circe.generic.auto._

case class FetchUserInfoPlanner(studentId: Int, override val planContext: PlanContext) extends Planner[UserInfo] {
  override def plan(using planContext: PlanContext): IO[UserInfo] = {
    // SQL query to fetch user information based on student_id
    val query = s"""
      SELECT student_id, name, profile
      FROM ${schemaName}.user
      WHERE student_id = ?
    """

    readDBRows(
      query,
      List(SqlParameter("Int", studentId.toString))
    ).flatMap {
      case Nil => IO.raiseError(new Exception("User not found for the given student ID"))
      case row :: _ =>
        for {
          userId <- row.asObject.flatMap(_.apply("studentID").flatMap(_.asNumber.flatMap(_.toInt))).fold(IO.raiseError[Int](new Exception("Invalid ID format")))(IO.pure)
          name <- row.asObject.flatMap(_.apply("name").flatMap(_.asString)).fold(IO.raiseError[String](new Exception("Invalid name format")))(IO.pure)
          profile <- row.asObject.flatMap(_.apply("profile").flatMap(_.asString)).fold(IO.raiseError[String](new Exception("Invalid profile format")))(IO.pure)
        } yield UserInfo(userId, name, profile)
    }
  }
}