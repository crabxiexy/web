package Impl

import java.util.Date
import cats.effect.IO
import io.circe.generic.auto.*
import Common.API.{PlanContext, Planner}
import Common.DBAPI.*
import Common.Object.{ParameterList, SqlParameter}
import Common.ServiceUtils.schemaName
import APIs.UserAPI.GroupexInfo

case class CreateGroupexPlanner(
                                        TA_id: Int,
                                        startTime: String,
                                        finishTime: String,
                                        location: String,
                                        sign_in: Int,
                                        sign_out: Int,
//                                        token: Int,
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
        // Insert a new group exercise record
        val insertGroupExercise = writeDB(
          s"""
             |WITH new_id AS (
             |  SELECT COALESCE(MAX(groupex_id), 0) + 1 AS next_id FROM groupex.groupex
             |)
             |INSERT INTO group_exercise (groupex_id, TA_id, startTime, finishTime, location, sign_in, sign_out)
             |SELECT new_id.next_id, ?, ?, ?, ?, ?, ?
             |FROM new_id
             |RETURNING groupex_id
           """.stripMargin,
          List(
            SqlParameter("Int", TA_id.toString),
            SqlParameter("Datetime", startTime),
            SqlParameter("Datetime", finishTime),
            SqlParameter("Text", location),
            SqlParameter("Int", sign_in.toString),
            SqlParameter("Int", sign_out.toString),
//            SqlParameter("Int", token.toString)
          )
        )

        insertGroupExercise.flatMap { groupExIdStr =>
          try {
            val groupExId = groupExIdStr.toInt // 尝试将字符串转换为Int
            IO.pure(GroupexInfo(groupExId).toString)
          } catch {
            case _: NumberFormatException =>
              IO.raiseError(new Exception("Failed to convert groupex_id to Int."))
          }
        }

      }
    }
  }
}
