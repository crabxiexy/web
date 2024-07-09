package Impl

import APIs.PatientAPI.PatientQueryMessage
import Common.API.{PlanContext, Planner}
import Common.DBAPI.{writeDB, *}
import Common.Object.{ParameterList, SqlParameter}
import Common.ServiceUtils.schemaName
import cats.effect.IO
import io.circe.Json
import io.circe.generic.auto.*
//*******************************
//现在delete只是在user大表和student.student里面删除，没有解决删除比如student_club对应表的问题
//**********************************
case class DeleteMessagePlanner(student_id: Int, override val planContext: PlanContext) extends Planner[String] {
  override def plan(using planContext: PlanContext): IO[String] = {
    // Check if the user exists in the user table
    val checkUserExists = readDBBoolean(s"SELECT EXISTS(SELECT 1 FROM ${schemaName}.user WHERE student_id = ?)",
      List(SqlParameter("Int", student_id.toString))
    )
//    val checkIdentityExists = readDBBoolean(s"SELECT EXISTS(SELECT 1 FROM ${schemaName}.${} WHERE student_id = ?)",
//      List(SqlParameter("Int", student_id.toString))
//    )
    checkUserExists.flatMap { exists =>
      if (!exists) {
        IO.raiseError(new Exception("student_id not found in user table"))
      } else {
        // Check if the user is a student or TA
          val identity = readDBInt(s"SELECT identity FROM ${schemaName}.user WHERE student_id = ?",
            List(SqlParameter("Int", student_id.toString))
          )
          val identityTable = identity.toString match {
            case "1" => "admin"
            case "2" => "student"
            case "3" => "ta"
            case "4" => "leader"
            case _ => throw new Exception("Unknown user identity")
          }
          // Delete the user from the user table
          writeDB(s"DELETE FROM ${schemaName}.user WHERE student_id = ?",
            List(SqlParameter("Int", student_id.toString))
          ).flatMap { _ =>
            // Delete the user from the corresponding table (student or TA)
            writeDB(s"DELETE FROM ${identityTable}.${identityTable} WHERE student_id = ?",
              List(SqlParameter("Int", student_id.toString))
            ).flatMap { _ =>
              IO.pure("User and associated records deleted successfully")
            }
          }
        }
      }
    }
}