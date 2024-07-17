package Impl

import cats.effect.IO
import Common.API.{PlanContext, Planner}
import Common.DBAPI._
import Common.Object.SqlParameter
import io.circe.generic.auto._

case class CountGroupexPlanner(
                                student_id: Int,
                                override val planContext: PlanContext
                              ) extends Planner[Int] { // Return type is Int for count

  override def plan(using planContext: PlanContext): IO[Int] = {
    // SQL query to count exercises for the given student_id
    val sqlQuery =
      """
        |SELECT COUNT(*) AS exercise_count FROM (
        |  SELECT student_id FROM groupex.sign_in
        |  INTERSECT
        |  SELECT student_id FROM groupex.sign_out
        |) AS both_signs
        |WHERE student_id = ?
      """.stripMargin

    // Prepare parameters
    val parameters = List(
      SqlParameter("Int", student_id.toString)
    )

    // Execute the query and return the count
    readDBRows(sqlQuery, parameters).map { rows =>
      rows.headOption.flatMap(row => row.hcursor.get[Int]("exercise_count").toOption).getOrElse(0)
    }
  }
}
