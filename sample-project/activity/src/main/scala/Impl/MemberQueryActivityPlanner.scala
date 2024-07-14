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

case class MemberQueryActivityPlanner(member_id: Int, club_name: String, currentTime: String, status1: Int, status2: Int, status3: Int, override val planContext: PlanContext) extends Planner[List[Json]] {
  override def plan(using planContext: PlanContext): IO[List[Json]] = {
    // 先检查是不是俱乐部成员
    val checkMemberExists = readDBBoolean(
      s"SELECT EXISTS(SELECT 1 FROM club.member WHERE member_id = ? AND club_name = ?)",
      List(SqlParameter("Int", member_id.toString), SqlParameter("String", club_name))
    )

    checkMemberExists.flatMap { exists =>
      if (!exists) {
        IO.raiseError(new Exception("You are not in this club!"))
      } else {
        // status1 = 0查询还未开始的活动，1查询进行中的活动，2查询已经结束的活动
        val (operatorStart, operatorFinish) = status1 match {
          case 0 => (">", ">")
          case 1 => (">=", "<")
          case 2 => ("<", "<")
          case _ => throw new IllegalArgumentException("Invalid status1 value")
        }

        // 构建时间条件
        val timeCondition = s"startTime $operatorStart ?${if (status1 != 0) s" AND finishTime $operatorFinish ?" else ""}"

        // 构建加入条件
        val joinCondition = status2 match {
          // status2 = 0查询已经加入的活动，1查询没有加入的活动
          case 0 => "EXISTS"
          case 1 => "NOT EXISTS"
          case _ => throw new IllegalArgumentException("Invalid status2 value")
        }

        // 构建status3的条件
        val status3Condition = status3 match {
          case 0 => "" // status3 = 0返回所有结果
          case 1 => "AND NOT EXISTS (SELECT 1 FROM activity.member am WHERE am.activity_id = a.activity_id AND am.member_id = ?) AND a.num < a.upLimit AND ? < a.startTime" // status3 = 1返回还没有报名且还可以报名的activity
          case _ => throw new IllegalArgumentException("Invalid status3 value")
        }

        // 构建完整的SQL查询
        val sqlQuery =
          s"""
             |SELECT a.activity_id, a.club_name, a.activity_name, a.intro, a.startTime, a.finishTime, a.organizor_id, a.lowLimit, a.upLimit, a.num
             |FROM ${schemaName}.activity a
             |WHERE a.club_name = ? AND $timeCondition
             |AND $joinCondition (
             |  SELECT 1 FROM ${schemaName}.member am
             |  WHERE am.activity_id = a.activity_id AND am.member_id = ?
             |)$status3Condition
             """.stripMargin

        // 准备查询参数
        val parameters = List(SqlParameter("String", club_name), SqlParameter("DateTime", currentTime)) ++
          (if (status1 != 0) List(SqlParameter("DateTime", currentTime)) else Nil) ++
          List(SqlParameter("Int", member_id.toString)) ++
          (if (status3 == 1) List(SqlParameter("DateTime", currentTime)) else Nil)

        // 执行查询
        readDBRows(sqlQuery, parameters)
      }
    }
  }
}
