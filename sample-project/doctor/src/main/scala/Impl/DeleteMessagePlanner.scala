package Impl

import APIs.PatientAPI.PatientQueryMessage
import Common.API.{PlanContext, Planner}
import Common.DBAPI.{writeDB, *}
import Common.Object.{ParameterList, SqlParameter}
import Common.ServiceUtils.schemaName
import cats.effect.IO
import io.circe.Json
import io.circe.generic.auto.*


case class DeleteMessagePlanner(student_id: Int, override val planContext: PlanContext) extends Planner[String] {
  override def plan(using planContext: PlanContext): IO[String] = {
    // Check if the user exists
    val checkUserExists = readDBBoolean(s"SELECT EXISTS(SELECT 1 FROM ${schemaName}.user WHERE student_id = ?)",
      List(SqlParameter("Int", student_id.toString))
    )

    checkUserExists.flatMap { exists =>
      if (!exists) {
        IO.raiseError(new Exception("student_id not found"))
      } else {
        // Delete the user
        writeDB(s"DELETE FROM ${schemaName}.user WHERE student_id = ?",
          List(SqlParameter("Int", student_id.toString))
        ).flatMap { _ =>
          IO.pure("User deleted successfully")
        }
      }
    }
  }
}
