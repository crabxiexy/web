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
         |INSERT INTO ${schemaName}.student (student_id, name, profile, TA_id, department, class_name,score )
         |VALUES (?, ?, ?, ?, ?, ?, ?)
       """.stripMargin

    val parameters = List(
      SqlParameter("Int", student.studentID.toString),
      SqlParameter("String", student.name),
      SqlParameter("String", student.profile),
      SqlParameter("Int", student.taID.toString),
      SqlParameter("String", student.department),
      SqlParameter("String", student.className),
        SqlParameter("Int", 0.toString)
    )

    writeDB(insertStatement, parameters).map(_ => student)
  }
}
