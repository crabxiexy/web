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

case class AssignClassPlanner(student_id: Int, classname: String, override val planContext: PlanContext) extends Planner[String] {
  override def plan(using planContext: PlanContext): IO[String] = {
    val checkStudentExists = readDBBoolean(s"SELECT EXISTS(SELECT 1 FROM ${schemaName}.${schemaName} WHERE student_id = ?)",
      List(SqlParameter("Int", student_id.toString))
    )
    checkStudentExists.flatMap{ exists =>
      if (!exists) {
        IO.raiseError(new Exception("student not found!"))
      }else{
        val assignDepartment = writeDB(
          s"UPDATE ${schemaName}.${schemaName} SET class = ? WHERE student_id = ?".stripMargin,
          List(
            SqlParameter("String", classname),
            SqlParameter("Int", student_id.toString)
          )
        )
        assignDepartment.flatMap { _ =>
          IO.pure("Class assigned successfully")
        }
      }
    }
  }
}