package Process

import Common.API.{API, PlanContext, TraceID}
import Global.{ServerConfig, ServiceCenter}
import Common.DBAPI.{initSchema, writeDB}
import Common.ServiceUtils.schemaName
import cats.effect.IO
import io.circe.generic.auto.*
import org.http4s.client.Client

import java.util.UUID

object Init {
  def init(config:ServerConfig):IO[Unit]=
    given PlanContext=PlanContext(traceID = TraceID(UUID.randomUUID().toString),0)
    for{
      _ <- API.init(config.maximumClientConnection)
      _ <- initSchema(schemaName)
      _ <- writeDB(s"CREATE TABLE IF NOT EXISTS ${schemaName}.${schemaName} (groupex_id INT PRIMARY KEY, ex_name TEXT, TA_id INT, startTime TIMESTAMPTZ , finishTime TIMESTAMPTZ, location TEXT, status INT, token TEXT)", List())
      _ <- writeDB(s"CREATE TABLE IF NOT EXISTS ${schemaName}.allstudent (groupex_id INT, student_id INT)", List())
      _ <- writeDB(s"CREATE TABLE IF NOT EXISTS ${schemaName}.sign_in(groupex_id INT, student_id INT)", List())
      _ <- writeDB(s"CREATE TABLE IF NOT EXISTS ${schemaName}.sign_out (groupex_id INT, student_id INT)", List())

    } yield ()

}
