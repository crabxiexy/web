package Impl

import cats.effect.IO
import Common.API.{PlanContext, Planner}
import Common.DBAPI._
import Common.Object.SqlParameter
import io.circe.generic.auto._

case class ExQueryPlanner(
                           groupex_id: Int,
                           in_out: Int,
                           override val planContext: PlanContext
                         ) extends Planner[Array[Int]] { // Change return type to Array[Int]

  override def plan(using planContext: PlanContext): IO[Array[Int]] = {
    // Determine the SQL query based on in_out
    val sqlQuery: String = in_out match {
      case 1 =>
        "SELECT student_id FROM groupex.sign_in WHERE groupex_id = ?"
      case 0 =>
        "SELECT student_id FROM groupex.sign_out WHERE groupex_id = ?"
      case 2 =>
        """
          |SELECT student_id FROM groupex.sign_in
          |WHERE groupex_id = ?
          |INTERSECT
          |SELECT student_id FROM groupex.sign_out
          |WHERE groupex_id = ?
        """.stripMargin
      case _ =>
        return IO.raiseError(new Exception("Invalid in_out parameter")).map(_ => Array.empty[Int])
    }

    // Prepare parameters
    val parameters = in_out match {
      case 2 =>
        List(
          SqlParameter("Int", groupex_id.toString),
          SqlParameter("Int", groupex_id.toString)
        )
      case _ =>
        List(SqlParameter("Int", groupex_id.toString))
    }

    // Execute the query
    readDBRows(sqlQuery, parameters).map { rows =>
      rows.map(row => row.hcursor.get[Int]("student_id").getOrElse(0)) // Safely extract student_id
    }.map(_.filter(_ != 0).toArray) // Filter out default values and convert to Array
  }
}
