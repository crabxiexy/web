package Impl

import Common.API.{PlanContext, Planner}
import Common.DBAPI.*
import Common.Object.SqlParameter
import cats.effect.IO
import io.circe.generic.auto.*

case class TASignPlanner(
                          groupex_id: Int,
                          TA_id: Int,
                          status: Int,
                          token: String,
                          override val planContext: PlanContext
                        ) extends Planner[String] {
  override def plan(using planContext: PlanContext): IO[String] = {
    // Directly update the sign status
    val changeSignStatus = writeDB(
      s"UPDATE groupex.groupex SET status = ?, token = ? WHERE groupex_id = ?".stripMargin,
      List(
        SqlParameter("Int", status.toString),
        SqlParameter("String", token),
        SqlParameter("Int", groupex_id.toString)
      )
    )

    changeSignStatus.map { _ =>
      "Sign status changed successfully!" // Return a success message
    }
  }
}