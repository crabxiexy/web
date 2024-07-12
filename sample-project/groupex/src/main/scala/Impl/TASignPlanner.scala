package Impl

import APIs.UserAPI.GroupexInfo
import Common.API.{PlanContext, Planner}
import Common.DBAPI.*
import Common.Object.{ParameterList, SqlParameter}
import Common.ServiceUtils.schemaName
import cats.effect.IO
import io.circe.generic.auto.*

import java.util.Date

case class TASignPlanner(
                                        groupex_id: Int,
                                        TA_id: Int,
                                        status: Int,
                                        token:String,
                                        override val planContext: PlanContext
                                      ) extends Planner[String] {
  override def plan(using planContext: PlanContext): IO[String] = {
    // Check if the TA is already registered
    val checkTAExists = readDBBoolean(s"SELECT EXISTS(SELECT 1 FROM TA.TA WHERE TA_id = ?)",
      List(SqlParameter("Int", TA_id.toString))
    )

    checkTAExists.flatMap { exists =>
      if (!exists) {
        IO.raiseError(new Exception("TA not found!"))
      } else {
        // Check whether this group_ex belongs to this TA
        val checkGroupexExists = readDBBoolean(s"SELECT EXISTS(SELECT 1 FROM groupex.groupex WHERE TA_id = ? AND groupex_id = ?)",
          List(SqlParameter("Int", TA_id.toString), SqlParameter("Int", groupex_id.toString))
        )
        checkGroupexExists.flatMap{
          exists =>
            if (!exists) {
              IO.raiseError(new Exception("groupex does not belong to TA!"))
            } else {
              val changeSignStatus = writeDB(
                s"UPDATE groupex.groupex SET status =? , token=?  WHERE groupex_id = ?".stripMargin,
                List(
                  SqlParameter("Int", status.toString),
                  SqlParameter("String", token.toString),
                  SqlParameter("Int", groupex_id.toString)
                )
              )
              changeSignStatus.flatMap { _ =>
                  IO.pure("Sign status changed successfully!")
              }
            }
        }
      }
    }
  }
}
