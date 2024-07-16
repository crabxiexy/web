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

case class AddProfilePlanner(club_name: String, profile: String, override val planContext: PlanContext) extends Planner[Unit] {
  override def plan(using planContext: PlanContext): IO[Unit] = {
    // SQL query to update the profile for the specified club_name
    val sqlQuery =
      s"""
         |UPDATE ${schemaName}.info
         |SET profile = ?
         |WHERE club_id = (SELECT club_id FROM ${schemaName}.info WHERE club_name = ?)
         """.stripMargin

    // Prepare parameters for the query
    val parameters = List(
      SqlParameter("Text", profile),
      SqlParameter("Text", club_name)
    )

    // Execute the update and return as IO[Unit]
    writeDB(sqlQuery, parameters).map(_ => ()) // Ensures return type is IO[Unit]
  }
}