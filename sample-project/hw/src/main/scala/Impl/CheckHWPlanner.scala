package Impl

import java.sql.Timestamp
import java.util.Date
import Common.API.{PlanContext, Planner}
import Common.DBAPI._
import Common.Object.SqlParameter
import Common.ServiceUtils.schemaName
import cats.effect.IO
import io.circe.generic.auto._
case class CheckHWPlanner(
                                HW_id: Int,
                                is_checked: Int,
                                response: String,
                                override val planContext: PlanContext
                              ) extends Planner[String] {

  override def plan(using planContext: PlanContext): IO[String] = {
    val checkHW = writeDB(
      s"""
         |UPDATE ${schemaName}.HW
         |SET is_checked = ?, response = ?
         |WHERE HW_id = ?
       """.stripMargin,
      List(
        SqlParameter("Int", is_checked.toString),
        SqlParameter("String", response),
        SqlParameter("Int", HW_id.toString)
      )
    )

    checkHW.map { _ =>
      "HW checked successfully!"
    }
  }
}