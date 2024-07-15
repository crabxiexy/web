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

case class CheckTokenPlanner(studentId: Int, token: String, override val planContext: PlanContext) extends Planner[String] {
  override def plan(using planContext: PlanContext): IO[String] = {
    // SQL query to check for the token and student_id in the state table
    val query = s"""
      SELECT submit_time
      FROM ${schemaName}.state
      WHERE student_id = ? AND token = ?
    """

    for {
      result <- readDBRows(
        query,
        List(
          SqlParameter("Int", studentId.toString),
          SqlParameter("String", token)
        )
      )
    } yield {
      result.headOption match {
        case Some(row) =>
          row.asObject.flatMap(_.apply("submitTime").flatMap(_.asString)) match {
            case Some(submitTimeStr) =>
              submitTimeStr.toLongOption match {
                case Some(submitTimeMillis) =>
                  val submitTimeStamp = Timestamp.from(Instant.ofEpochMilli(submitTimeMillis))
                  val currentTime = Timestamp.from(Instant.now())
                  val diffMinutes = (currentTime.getTime - submitTimeStamp.getTime) / 60000

                  if (diffMinutes > 10) {
                    "Token has expired."
                  } else {
                    "Token is valid."
                  }
                case None => "Invalid submit_time format."
              }
            case None => "Invalid submit_time format."
          }
        case None => "Token or student ID not found."
      }
    }
  }
}
