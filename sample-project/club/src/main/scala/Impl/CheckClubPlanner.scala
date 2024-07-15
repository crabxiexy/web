package Impl

import Common.API.{PlanContext, Planner}
import Common.DBAPI.{writeDB, *}
import Common.Object.{ParameterList, SqlParameter}
import Common.ServiceUtils.schemaName
import cats.effect.IO
import io.circe.Json
import io.circe.generic.auto._

case class CheckClubPlanner(clubName: String, override val planContext: PlanContext) extends Planner[Boolean] {
  override def plan(using planContext: PlanContext): IO[Boolean] = {
    val checkClubExistsQuery =
      s"SELECT EXISTS(SELECT 1 FROM ${schemaName}.info WHERE name = ?)"

    readDBBoolean(checkClubExistsQuery, List(SqlParameter("String", clubName)))
  }
}

case class ClubMembersPlanner(studentId: Int, override val planContext: PlanContext) extends Planner[List[Json]] {
  override def plan(using planContext: PlanContext): IO[List[Json]] = {
    val clubNamesQuery =
      s"""
         |SELECT club_name
         |FROM ${schemaName}.member
         |WHERE member = ?
       """.stripMargin

    for {
      clubNames <- readDBRows(clubNamesQuery, List(SqlParameter("Int", studentId.toString)))
      clubNamesList = clubNames.flatMap { json =>
        json.asObject.flatMap(_.apply("club_name").flatMap(_.asString))
      }

      result <- if (clubNamesList.isEmpty) {
        IO.pure(List.empty[Json])
      } else {
        val infoQuery =
          s"""
             |SELECT *
             |FROM ${schemaName}.info
             |WHERE name IN (${clubNamesList.map("'" + _ + "'").mkString(",")})
           """.stripMargin

        readDBRows(infoQuery, List.empty)
      }
    } yield result
  }
}
