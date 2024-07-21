package Impl

import Common.API.{PlanContext, Planner}
import Common.DBAPI.readDBRows
import Common.Object.SqlParameter
import Common.ServiceUtils.schemaName
import cats.effect.IO
import io.circe.Json
import io.circe.generic.auto._
import Common.Model.{Student, Score}

import APIs.ActivityAPI.CountHWMessage
import APIs.RunAPI.CountRunMessage
import APIs.GroupexAPI.CountGroupexMessage

case class FetchStudentInfoPlanner(studentId: Int, override val planContext: PlanContext) extends Planner[Option[Student]] {

  override def plan(using planContext: PlanContext): IO[Option[Student]] = {
    val sqlQuery =
      s"""
         |SELECT student_id, name, profile, TA_id, score, department, class_name
         |FROM ${schemaName}.student
         |WHERE student_id = ?
       """.stripMargin

    val fetchStudentQuery = readDBRows(sqlQuery, List(SqlParameter("Int", studentId.toString)))
      .map { rows =>
        rows.headOption.flatMap { json =>
          // Manually extract fields from JSON
          for {
            studentId <- json.hcursor.get[Int]("studentID").toOption
            name <- json.hcursor.get[String]("name").toOption
            profile <- json.hcursor.get[String]("profile").toOption
            taId <- json.hcursor.get[Int]("taID").toOption
            department <- json.hcursor.get[String]("department").toOption
            className <- json.hcursor.get[String]("className").toOption
          } yield (Student(studentId, name, profile, taId, Score(0, 0, 0, 0), department, className), json)
        }
      }

    fetchStudentQuery.flatMap {
      case Some((student, json)) =>
        // Fetch activity score
        val activityScoreIO: IO[Int] = CountHWMessage(studentId).send

        // Fetch run score
        val runScoreIO: IO[Int] = CountRunMessage(studentId).send

        // Fetch groupex score
        val groupexScoreIO: IO[Int] = CountGroupexMessage(studentId).send

        // Combine scores into Student object
        for {
          activityScore <- activityScoreIO.handleErrorWith { error =>
            IO.raiseError(new Exception(s"Failed to fetch activity score: ${error.getMessage}"))
          }
          runScore <- runScoreIO.handleErrorWith { error =>
            IO.raiseError(new Exception(s"Failed to fetch run score: ${error.getMessage}"))
          }
          groupexScore <- groupexScoreIO.handleErrorWith { error =>
            IO.raiseError(new Exception(s"Failed to fetch groupex score: ${error.getMessage}"))
          }
        } yield Some(student.copy(score = Score(runScore, groupexScore, activityScore, json.hcursor.get[Int]("score").getOrElse(0))))

      case None =>
        IO.pure(None) // Student not found
    }
  }
}
