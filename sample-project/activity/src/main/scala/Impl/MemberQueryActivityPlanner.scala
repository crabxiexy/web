package Impl

import Common.API.{PlanContext, Planner}
import Common.DBAPI.{readDBBoolean, readDBRows, writeDB}
import Common.Object.{ParameterList, SqlParameter}
import Common.ServiceUtils.schemaName
import cats.effect.IO
import io.circe.Json
import io.circe.generic.auto.*
import APIs.ClubAPI.CheckMemberMessage


// 定义枚举类型
enum ActivityStatus:
  case NotStarted, InProgress, Finished, NotFinished

object ActivityStatus:
  def fromInt(value: Int): Either[String, ActivityStatus] = value match
    case 0 => Right(NotStarted)
    case 1 => Right(InProgress)
    case 2 => Right(Finished)
    case 3 => Right(NotFinished)
    case _ => Left("Invalid ActivityStatus value")

enum JoinStatus:
  case Joined, NotJoined

object JoinStatus:
  def fromInt(value: Int): Either[String, JoinStatus] = value match
    case 0 => Right(Joined)
    case 1 => Right(NotJoined)
    case _ => Left("Invalid JoinStatus value")

enum AdditionalStatus:
  case All, AvailableToJoin

object AdditionalStatus:
  def fromInt(value: Int): Either[String, AdditionalStatus] = value match
    case 0 => Right(All)
    case 1 => Right(AvailableToJoin)
    case _ => Left("Invalid AdditionalStatus value")

// 修改后的 MemberQueryActivityPlanner 类
case class MemberQueryActivityPlanner(
                                       member_id: Int,
                                       club_name: String,
                                       currentTime: String,
                                       status1: ActivityStatus,
                                       status2: JoinStatus,
                                       status3: AdditionalStatus,
                                       override val planContext: PlanContext
                                     ) extends Planner[List[Json]] {
  override def plan(using planContext: PlanContext): IO[List[Json]] = {
    // 先检查是不是俱乐部成员
    val checkMemberExists = CheckMemberMessage(club_name, member_id).send

    checkMemberExists.flatMap { exists =>
      if (!exists) {
        IO.raiseError(new Exception("You are not in this club!"))
      } else {
        // status1 = 0查询还未开始的活动，1查询进行中的活动，2查询已经结束的活动，3查询未结束的活动
        val (operatorStart, operatorFinish) = status1 match {
          case ActivityStatus.NotStarted => (">", ">")
          case ActivityStatus.InProgress => ("<", ">")
          case ActivityStatus.Finished => ("<", "<")
          case ActivityStatus.NotFinished => ("", ">")
        }

        // 构建时间条件
        val timeCondition = status1 match {
          case ActivityStatus.NotStarted | ActivityStatus.InProgress | ActivityStatus.Finished =>
            s"a.startTime $operatorStart ? AND a.finishTime $operatorFinish ?"
          case ActivityStatus.NotFinished =>
            s"a.finishTime $operatorFinish ?"
        }

        // 构建加入条件
        val joinCondition = status2 match {
          // status2 = 0查询已经加入的活动，1查询没有加入的活动
          case JoinStatus.Joined => "EXISTS"
          case JoinStatus.NotJoined => "NOT EXISTS"
        }

        // 构建status3的条件
        val status3Condition = status3 match {
          case AdditionalStatus.All => "" // status3 = 0返回所有结果
          case AdditionalStatus.AvailableToJoin =>
            "AND NOT EXISTS (SELECT 1 FROM activity.member am WHERE am.activity_id = a.activity_id AND am.member_id = ?) AND a.num < a.upLimit AND ? < a.finishTime" // status3 = 1返回还没有报名且还可以报名的activity
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
             |) $status3Condition
             """.stripMargin

        // 准备查询参数
        val parameters = List(SqlParameter("String", club_name), SqlParameter("DateTime", currentTime)) ++
          (if (status1 != ActivityStatus.NotStarted && status1 != ActivityStatus.NotFinished) List(SqlParameter("DateTime", currentTime)) else Nil) ++
          List(SqlParameter("Int", member_id.toString)) ++
          (if (status3 == AdditionalStatus.AvailableToJoin) List(SqlParameter("Int", member_id.toString), SqlParameter("DateTime", currentTime)) else Nil)

        // 执行查询
        readDBRows(sqlQuery, parameters)
      }
    }
  }
}


