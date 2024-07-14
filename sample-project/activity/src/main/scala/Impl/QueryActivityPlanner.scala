package Impl

import APIs.PatientAPI.PatientQueryMessage
import Common.API.{PlanContext, Planner}
import Common.DBAPI.{readDBBoolean, readDBRows, writeDB}
import Common.Object.{ParameterList, SqlParameter}
import Common.ServiceUtils.schemaName
import cats.effect.IO
import io.circe.Json
import io.circe.generic.auto.*

import java.security.MessageDigest
import java.util.Base64

case class QueryActivityPlanner(member_id: Int, club_name: String, currentTime: String, status: Int, override val planContext: PlanContext) extends Planner[List[Json]] {
  override def plan(using planContext: PlanContext): IO[List[Json]] = {
    //先检查是不是俱乐部成员
    val checkMemberExists = readDBBoolean(
      s"SELECT EXISTS(SELECT 1 FROM club.member WHERE member_id = ? AND club_name = ?)",
      List(SqlParameter("Int", member_id.toString), SqlParameter("String", club_name))
    )

    checkMemberExists.flatMap { exists =>
      if (!exists) {
        IO.raiseError(new Exception("You are not in this club!"))
      } else {
        // status = 0,查询还未开始的活动，1查询进行中的活动，2查询已经结束的活动
        val (operatorStart, operatorFinish) = status match {
          case 0 => (">", ">")
          case 1 => (">=", "<")
          case 2 => ("<", "<")
          case _ => throw new IllegalArgumentException("Invalid status value")
        }

        val sqlQuery =
          s"""
             |SELECT activity_id, club_name, activity_name, intro, startTime, finishTime, organizor_id, lowLimit, upLimit, num
             |FROM ${schemaName}.activity
             |WHERE club_name = ? AND startTime $operatorStart ?${if (status != 0) s"AND finishTime $operatorFinish ?" else ""}
             """.stripMargin

        // Prepare the parameters for the query
        val parameters = List(SqlParameter("String", club_name), SqlParameter("DateTime", currentTime)) ++
          (if (status != 0) List(SqlParameter("DateTime", currentTime)) else Nil)

        // Execute the query using readDBRows
        readDBRows(sqlQuery, parameters)
      }
    }
  }
}
