package Impl

import Common.API.{PlanContext, Planner}
import Common.DBAPI.{writeDB, *}
import Common.Object.{ParameterList, SqlParameter}
import Common.ServiceUtils.schemaName
import cats.effect.IO
import io.circe.Json
import io.circe.generic.auto.*

import java.security.MessageDigest
import java.util.Base64


case class CheckLeaderPlanner(club_name: String, leader_id: Int, override val planContext: PlanContext) extends Planner[Boolean] {
  override def plan(using planContext: PlanContext): IO[Boolean] = {
    val checkClubExists = readDBBoolean(s"SELECT EXISTS(SELECT 1 FROM ${schemaName}.info WHERE name = ? AND leader = ?)",
      List(SqlParameter("String", club_name), SqlParameter("Int", leader_id.toString))
    )
    checkClubExists
  }
}