package Impl

import APIs.StudentAPI.FetchStudentInfoMessage
import Common.API.{PlanContext, Planner}
import Common.DBAPI.readDBRows
import Common.Object.SqlParameter
import Common.ServiceUtils.schemaName
import cats.effect.IO
import cats.implicits._
import io.circe.Json
import io.circe.generic.auto._
import Common.Model.{Activity, Club, Student}
import APIs.ClubAPI.CheckMemberMessage
import APIs.ClubAPI.FetchClubInfoMessage
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
                                     ) extends Planner[List[Activity]] {

  override def plan(using planContext: PlanContext): IO[List[Activity]] = {
    // 先检查是不是俱乐部成员
    val checkMemberExists = CheckMemberMessage(club_name, member_id).send

    checkMemberExists.flatMap { exists =>
      if (!exists) {
        IO.raiseError(new Exception("You are not in this club!"))
      } else {
        // 根据状态构建 SQL 查询条件
        val (operatorStart, operatorFinish) = status1 match {
          case ActivityStatus.NotStarted => (">", ">")
          case ActivityStatus.InProgress => ("<", ">")
          case ActivityStatus.Finished => ("<", "<")
          case ActivityStatus.NotFinished => ("", ">")
        }

        val timeCondition = status1 match {
          case ActivityStatus.NotStarted | ActivityStatus.InProgress | ActivityStatus.Finished =>
            s"a.startTime $operatorStart ? AND a.finishTime $operatorFinish ?"
          case ActivityStatus.NotFinished =>
            s"a.finishTime $operatorFinish ?"
        }

        val joinCondition = status2 match {
          case JoinStatus.Joined => "EXISTS"
          case JoinStatus.NotJoined => "NOT EXISTS"
        }

        val status3Condition = status3 match {
          case AdditionalStatus.All => "" // status3 = 0返回所有结果
          case AdditionalStatus.AvailableToJoin =>
            "AND NOT EXISTS (SELECT 1 FROM activity.member am WHERE am.activity_id = a.activity_id AND am.member_id = ?) AND a.num < a.upLimit AND ? < a.finishTime"
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

        // 执行查询并解析结果
        readDBRows(sqlQuery, parameters).flatMap { rows =>
          rows.traverse { json =>
            val activityID = json.hcursor.downField("activityID").as[Int].getOrElse(0)
            val clubName = json.hcursor.downField("clubName").as[String].getOrElse("")
            val activityName = json.hcursor.downField("activityName").as[String].getOrElse("")
            val intro = json.hcursor.downField("intro").as[String].getOrElse("")
            val startTime = json.hcursor.downField("startTime").as[String].getOrElse("")
            val finishTime = json.hcursor.downField("finishTime").as[String].getOrElse("")
            val organizorId = json.hcursor.downField("organizorID").as[Int].getOrElse(0)
            val lowLimit = json.hcursor.downField("lowLimit").as[Int].getOrElse(0)
            val upLimit = json.hcursor.downField("upLimit").as[Int].getOrElse(0)
            val num = json.hcursor.downField("num").as[Int].getOrElse(0)

            // Fetch club info
            val fetchClubInfo = FetchClubInfoMessage(clubName).send

            // Fetch organizer info
            val fetchOrganizorInfo = FetchStudentInfoMessage(organizorId).send

            // Fetch members info
            val membersQuery =
              s"""
                 |SELECT member
                 |FROM ${schemaName}.member
                 |WHERE activity_id = ?
               """.stripMargin

            val fetchMembers = readDBRows(membersQuery, List(SqlParameter("Int", activityID.toString))).flatMap { memberRows =>
              memberRows.traverse { memberJson =>
                val memberId = memberJson.hcursor.downField("member").as[Int].getOrElse(0)
                FetchStudentInfoMessage(memberId).send
              }
            }

            for {
              club <- fetchClubInfo
              organizor <- fetchOrganizorInfo
              members <- fetchMembers
            } yield {
              Activity(
                activityID = activityID,
                club = club,
                activityName = activityName,
                intro = intro,
                startTime = startTime,
                finishTime = finishTime,
                organizor = organizor,
                lowLimit = lowLimit,
                upLimit = upLimit,
                num = num,
                members = members
              )
            }
          }
        }
      }
    }
  }
}