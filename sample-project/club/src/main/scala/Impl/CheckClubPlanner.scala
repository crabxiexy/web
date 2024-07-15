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

case class CheckClubPlanner(studentId: Int, override val planContext: PlanContext) extends Planner[List[Json]] {
  override def plan(using planContext: PlanContext): IO[List[Json]] = {
    // 查询与 student_id 相关的所有 club_name
    val clubNamesQuery =
      s"""
         |SELECT club_name
         |FROM ${schemaName}.member
         |WHERE member = ?
       """.stripMargin

    for {
      clubNames <- readDBRows(clubNamesQuery, List(SqlParameter("Int", studentId.toString)))
      // 从查询结果中提取 club_name
      clubNamesList = clubNames.flatMap { json =>
        json.asObject.flatMap(_.apply("club_name").flatMap(_.asString))
      }

      result <- if (clubNamesList.isEmpty) {
        IO.pure(List.empty[Json])
      } else {
        // 使用 club_name 从 info 表中获取所有相关的完整信息
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
