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
case class CheckAvailablePlanner(studentId: Int, override val planContext: PlanContext) extends Planner[List[Json]] {
  override def plan(using planContext: PlanContext): IO[List[Json]] = {
    // Step 1: Fetch the student's department
    val departmentQuery =
      s"""
         |SELECT department
         |FROM student.student
         |WHERE student_id = ?
       """.stripMargin

    for {
      studentDeptResult <- readDBRows(departmentQuery, List(SqlParameter("Int", studentId.toString)))
      studentDepartment = studentDeptResult.flatMap(_.asObject.flatMap(_.apply("department").flatMap(_.asString))).headOption.getOrElse("")

      // Step 2: Fetch all club names for the student
      clubNamesQuery =
        s"""
           |SELECT club_name
           |FROM ${schemaName}.member
           |WHERE member = ?
         """.stripMargin

      clubNames <- readDBRows(clubNamesQuery, List(SqlParameter("Int", studentId.toString)))

      // Extract club names from the result
      clubNamesList = clubNames.flatMap { json =>
        json.asObject.flatMap(_.apply("club_name").flatMap(_.asString))
      }

      // Step 3: Fetch all clubs from info table, filtering by department
      infoQuery =
        s"""
           |SELECT *
           |FROM ${schemaName}.info
           |WHERE department = ? OR department LIKE '%所有人%'
         """.stripMargin

      clubInfo <- readDBRows(infoQuery, List(SqlParameter("String", studentDepartment)))

      // Step 4: Filter out clubs the student is already a member of
      results = clubInfo.filterNot { json =>
        val clubName = json.asObject.flatMap(_.apply("name").flatMap(_.asString)).getOrElse("")
        clubNamesList.contains(clubName)
      }

    } yield results
  }
}