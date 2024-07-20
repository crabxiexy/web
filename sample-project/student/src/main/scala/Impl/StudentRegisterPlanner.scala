package Impl

import Common.Model.Student
import Common.API.{PlanContext, Planner}
import Common.DBAPI.writeDB
import Common.Object.SqlParameter
import cats.effect.IO
import Common.ServiceUtils.schemaName

import io.circe.generic.auto._

case class StudentRegisterPlanner(student: Student, override val planContext: PlanContext) extends Planner[Student] {
  override def plan(using planContext: PlanContext): IO[Student] = {
    val insertStatement =
      s"""
         |INSERT INTO ${schemaName}.student (student_id, name, profile, TA_id, department, class_name )
         |VALUES (?, ?, ?, ?, ?, ?)
       """.stripMargin

    val parameters = List(
      SqlParameter("Int", student.student_id.toString),
      SqlParameter("String", student.name),
      SqlParameter("String", student.profile),
      SqlParameter("Int", student.TA_id.toString),
      SqlParameter("String", student.department),
      SqlParameter("String", student.class_name)
    )

    writeDB(insertStatement, parameters).map(_ => student)
  }
}
