package Impl

import Common.API.{PlanContext, Planner}
import Common.DBAPI.{writeDB, *}
import Common.Object.{ParameterList, SqlParameter}
import Common.ServiceUtils.schemaName
import cats.effect.IO
import io.circe.Json
import io.circe.generic.auto._

case class CheckClubExistPlanner(club_name: String, override val planContext: PlanContext) extends Planner[Boolean] {
  override def plan(using planContext: PlanContext): IO[Boolean] = {
    val checkClubExistsQuery = readDBBoolean(s"SELECT EXISTS(SELECT 1 FROM ${schemaName}.info WHERE name = ?)",
      List(SqlParameter("String", club_name)))
    checkClubExistsQuery
  }
}