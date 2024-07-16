package Impl

import APIs.PatientAPI.PatientQueryMessage
import Common.API.{PlanContext, Planner}
import Common.DBAPI.{writeDB, *}
import Common.Object.{ParameterList, SqlParameter}
import Common.ServiceUtils.schemaName
import cats.effect.IO
import io.circe.Json
import io.circe.generic.auto._

case class CheckJointClubPlanner(studentId: Int, override val planContext: PlanContext) extends Planner[List[Json]] {
  override def plan(using planContext: PlanContext): IO[List[Json]] = {
    // Step 1: Query to get all club names for the student
    val clubNamesQuery =
      s"""
         |SELECT club_name
         |FROM ${schemaName}.member
         |WHERE member = ?
       """.stripMargin

    for {
      clubNames <- readDBRows(clubNamesQuery, List(SqlParameter("Int", studentId.toString)))

      // Extract club names from the query result
      clubNamesList = clubNames.flatMap { json =>
        json.asObject.flatMap(_.apply("clubName").flatMap(_.asString))
      }.toSet // Use Set for efficient filtering

      result <- if (clubNamesList.isEmpty) {
        IO.pure(List.empty[Json])
      } else {
        // Step 2: Fetch full club information while filtering out clubs where the student is the leader
        val infoQuery =
          s"""
             |SELECT *
             |FROM ${schemaName}.info
             |WHERE name IN (${clubNamesList.map("'" + _ + "'").mkString(",")})
           """.stripMargin

        readDBRows(infoQuery, List())
      }
    } yield result
  }
}
