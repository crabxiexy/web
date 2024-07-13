package Impl

import cats.effect.IO
import Common.API.{PlanContext, Planner}
import Common.DBAPI._
import Common.Object.SqlParameter
import io.circe.Json
import io.circe.generic.auto._
import cats.Traverse._
import io.circe.parser._
import cats.syntax.traverse._

case class StudentRecordQueryPlanner(
                                      student_id: Int,
                                      override val planContext: PlanContext
                                    ) extends Planner[List[Json]] {

  override def plan(using planContext: PlanContext): IO[List[Json]] = {
    val checkStudentExists = readDBBoolean(
      s"SELECT EXISTS(SELECT 1 FROM student.student WHERE student_id = ?)",
      List(SqlParameter("Int", student_id.toString))
    )

    checkStudentExists.flatMap { exists =>
      if (!exists) {
        IO.raiseError(new Exception("Student not found!"))
      } else {
        val sqlQuery =
          s"""
             |SELECT
             |  g.groupex_id,
             |  g.ex_name,
             |  g.starttime,
             |  g.finishtime
             |FROM
             |  groupex.groupex g
             |WHERE
             |  EXISTS (SELECT 1 FROM groupex.sign_in si WHERE si.student_id = ? AND si.groupex_id = g.groupex_id)
             |  OR EXISTS (SELECT 1 FROM groupex.sign_out so WHERE so.student_id = ? AND so.groupex_id = g.groupex_id)
           """.stripMargin

        readDBRows(sqlQuery, List(
          SqlParameter("Int", student_id.toString),
          SqlParameter("Int", student_id.toString)
        )).flatMap { rows =>
          rows.toList.traverse { row =>
            for {
              gid <- IO.fromOption(row.hcursor.get[Int]("groupexID").toOption)(new Exception("groupex_id not found"))
              st <- IO.fromOption(row.hcursor.get[String]("starttime").toOption)(new Exception("start_time not found"))
              ft <- IO.fromOption(row.hcursor.get[String]("finishtime").toOption)(new Exception("finish_time not found"))
              exn  <- IO.fromOption(row.hcursor.get[String]("exName").toOption)(new Exception("finish_time not found"))
              hasSignedIn <- readDBBoolean(
                s"SELECT EXISTS (SELECT 1 FROM groupex.sign_in si WHERE si.groupex_id = ? AND si.student_id = ?)",
                List(SqlParameter("Int", gid.toString), SqlParameter("Int", student_id.toString))
              )

              hasSignedOut <- readDBBoolean(
                s"SELECT EXISTS (SELECT 1 FROM groupex.sign_out so WHERE so.groupex_id = ? AND so.student_id = ?)",
                List(SqlParameter("Int", gid.toString), SqlParameter("Int", student_id.toString))
              )
            } yield {
              Json.obj(
                "groupex_id" -> Json.fromInt(gid),
                "ex_name"-> Json.fromString(exn),
                "start_time" -> Json.fromString(st),
                "finish_time" -> Json.fromString(ft),
                "has_signed_in" -> Json.fromBoolean(hasSignedIn),
                "has_signed_out" -> Json.fromBoolean(hasSignedOut)
              )
            }
          }
        }
      }
    }
  }
}
