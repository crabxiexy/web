package Impl


import Common.API.{PlanContext, Planner}
import Common.DBAPI.{writeDB, *}
import Common.Object.{ParameterList, SqlParameter}
import Common.ServiceUtils.schemaName
import cats.effect.IO
import io.circe.Json
import io.circe.generic.auto.*

import java.security.MessageDigest
import java.util.Base64

case class AddMemberPlanner(club_name: String, member_id: Int, override val planContext: PlanContext) extends Planner[String] {
  override def plan(using planContext: PlanContext): IO[String] = {
    val checkMemberExists = readDBBoolean(s"SELECT EXISTS(SELECT 1 FROM ${schemaName}.member WHERE name = ? AND member_name = ?)",
      List(SqlParameter("String", club_name), SqlParameter("Int", member_id.toString))
    )
    checkMemberExists.flatMap { exists =>
      if (exists) {
        IO.raiseError(new Exception("This student has already been a member of the club"))
      } else {
        // Use SQL to get the new ID and insert the new user in one transaction
        val insertMember = writeDB(
          s"""
             |INSERT INTO ${schemaName}.member (club_name, member)
             |VALUES (?, ?)
        """.stripMargin,
          List(
            SqlParameter("String", club_name),
            SqlParameter("Int", member_id.toString)
          )
        )
        // Chain the insertUser operation after the insertIdentity operation
        insertMember.flatMap { _ =>
          IO.pure("Member added successfully")
        }
      }
    }
  }
}