package Impl
import APIs.PatientAPI.PatientQueryMessage
import APIs.UserAPI.StartRunningInfo
import Common.API.{PlanContext, Planner}
import Common.DBAPI.*
import Common.Object.{ParameterList, SqlParameter}
import Common.ServiceUtils.schemaName
import cats.effect.IO
import io.circe.generic.auto.*

import java.security.MessageDigest
import java.util.{Base64, Date}

case class FinishRunningPlanner(run_id: Int, distance: Double, png:Array[Byte], override val planContext: PlanContext) extends Planner[String] {
  override def plan(using planContext: PlanContext): IO[String] = {
    // Check if the user is already registered
    val checkRunExists = readDBBoolean(s"SELECT EXISTS(SELECT 1 FROM run.run WHERE run_id = ?)",
      List(SqlParameter("Int", run_id.toString))
    )

    checkRunExists.flatMap { exists =>
      if (!exists) {
        IO.raiseError(new Exception("Running not found!"))
      } else {
        val finishTime = new Date()
        val finishRunning = writeDB(
          s"UPDATE run.run SET finishTime = ? AND distance =? AND png = ? AND status = ? WHERE run_id = ?".stripMargin,
          List(
            SqlParameter("Timestamp", finishTime.getTime.toString),
            SqlParameter("Int", distance.toString),
            SqlParameter("Array[Byte]", png.toString),
            SqlParameter("Boolean", 0.toString),
            SqlParameter("Int", run_id.toString),
          )
        )
          checkRunExists.flatMap { _ =>
            IO.pure(s"Running finished! Congratulations!")
          }
        }
      }
    }
  }