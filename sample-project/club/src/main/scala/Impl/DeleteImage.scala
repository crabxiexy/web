package Impl


import Common.API.{PlanContext, Planner}
import Common.DBAPI.{writeDB, *}
import Common.Object.{ParameterList, SqlParameter}
import Common.ServiceUtils.schemaName
import cats.effect.IO
import io.circe.Json
import io.circe.generic.auto.*

case class DeleteImagePlanner(imageId: Int, override val planContext: PlanContext) extends Planner[String] {
  override def plan(using planContext: PlanContext): IO[String] = {
    val deleteQuery =
      s"DELETE FROM ${schemaName}.photo WHERE id = ?"

    writeDB(deleteQuery, List(SqlParameter("Int", imageId.toString)))
  }
}