package Impl

import APIs.PatientAPI.PatientQueryMessage
import Common.API.{PlanContext, Planner}
import Common.DBAPI.{readDBBoolean, readDBInt, readDBRows, writeDB}
import Common.Object.{ParameterList, SqlParameter}
import Common.ServiceUtils.schemaName
import cats.effect.IO
import io.circe.Json
import io.circe.generic.auto.*

import java.security.MessageDigest
import java.util.Base64

case class JoinActivityPlanner(member_id: Int, activity_id: Int, override val planContext: PlanContext) extends Planner[String] {
  override def plan(using planContext: PlanContext): IO[String] = {
    //默认UI是先查询了可以加入的活动，再能够选择加入，所以没有考虑时间或者鉴权的问题:)另外只考虑了人数上限带来的报名限制
    // 构建SQL查询，用于写入新的活动成员记录并更新活动表中的num
    val updateNumSql =
      s"""
         |UPDATE ${schemaName}.activity
         |SET num = num + 1
         |WHERE activity_id = ?
         """.stripMargin
    val updateNumParameters = List(SqlParameter("Int", activity_id.toString))
    val updateNum = writeDB(updateNumSql, updateNumParameters)

    // 构建SQL查询，用于插入新的活动成员记录
    val insertActivityMemberSql =
      s"""
         |INSERT INTO ${schemaName}.member (activity_id, member_id)
         |VALUES (?, ?)
         """.stripMargin
    val insertActivityMemberParameters = List(SqlParameter("Int", activity_id.toString), SqlParameter("Int", member_id.toString))
    val insertActivityMember = writeDB(insertActivityMemberSql, insertActivityMemberParameters)
    
    (updateNum *> insertActivityMember).map { _ =>
      "Join activity successfully!"
    }
  }
}
