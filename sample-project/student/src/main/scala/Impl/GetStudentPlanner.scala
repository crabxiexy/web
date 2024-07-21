package Impl

import Common.API.{PlanContext, Planner}
import Common.DBAPI.{readDBRows, *}
import Common.Object.SqlParameter
import Common.ServiceUtils.schemaName
import cats.effect.IO
import cats.implicits._
import Common.Model.{Student, Score}
import io.circe.generic.auto._
import APIs.ActivityAPI.CountHWMessage
import APIs.RunAPI.CountRunMessage
import APIs.GroupexAPI.CountGroupexMessage

case class GetStudentPlanner(
                              override val planContext: PlanContext
                            ) extends Planner[List[Student]] {

  override def plan(using planContext: PlanContext): IO[List[Student]] = {
    // Construct the SQL query to fetch all fields where TA_id is -1
    val sqlQuery =
      s"""
         |SELECT student_id , name, profile, TA_id , department, class_name
         |FROM ${schemaName}.student
         |WHERE TA_id = -1
       """.stripMargin

    // Execute the query using readDBRows and map the result to List[Student]
    val fetchStudentsQuery = readDBRows(sqlQuery, List())
      .map { rows =>
        rows.map { json =>
          // Manually extract fields from JSON
          for {
            studentId <- json.hcursor.get[Int]("studentID").toOption
            name <- json.hcursor.get[String]("name").toOption
            profile <- json.hcursor.get[String]("profile").toOption
            taId <- json.hcursor.get[Int]("taID").toOption
            department <- json.hcursor.get[String]("department").toOption
            className <- json.hcursor.get[String]("className").toOption
          } yield (Student(studentId, name, profile, taId, Score(0, 0, 0, 0), department, className), json)
        }.flatten
      }

    fetchStudentsQuery.flatMap { students =>
      // Fetch scores for all students
      val scoresIO = students.map { case (student, json) =>
        // Fetch activity score
        val activityScoreIO: IO[Int] = CountHWMessage(student.studentID).send

        // Fetch run score
        val runScoreIO: IO[Int] = CountRunMessage(student.studentID).send

        // Fetch groupex score
        val groupexScoreIO: IO[Int] = CountGroupexMessage(student.studentID).send

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
        } yield student.copy(score = Score(runScore, groupexScore, activityScore, json.hcursor.get[Int]("score").getOrElse(0)))
      }

      // Combine all student score IO actions into a single IO action
      val allScoresIO: IO[List[Student]] = scoresIO.sequence

      // Return the list of students with updated scores
      allScoresIO
    }
  }
}