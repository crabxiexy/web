package Impl


import Common.API.{PlanContext, Planner}
import Common.DBAPI.{writeDB, *}
import Common.Object.{ParameterList, SqlParameter}
import Common.ServiceUtils.schemaName
import cats.effect.IO
import io.circe.Json
import io.circe.generic.auto.*

case class UploadImagePlanner(clubName: String, uploaderId: Int, image: String, override val planContext: PlanContext) extends Planner[String] {
  override def plan(using planContext: PlanContext): IO[String] = {
    val insertQuery =
      s"""
         |INSERT INTO ${schemaName}.photo (club_name, uploader_id, image, submit_time)
         |VALUES (?, ?, ?, NOW())
       """.stripMargin

    writeDB(insertQuery, List(
      SqlParameter("String", clubName),
      SqlParameter("Int", uploaderId.toString),
      SqlParameter("String", image)
    ))
  }
}
