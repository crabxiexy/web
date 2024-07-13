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
      _ <- writeDB(s"CREATE TABLE IF NOT EXISTS ${schemaName}.info (club_id INT, name TEXT, leader INT, intro TEXT, department TEXT)", List())
      _ <- writeDB(s"CREATE TABLE IF NOT EXISTS ${schemaName}.member (club_name INT, member INT)", List())
      _ <- writeDB(s"CREATE TABLE IF NOT EXISTS ${schemaName}.application (name INT, leader INT, intro TEXT, department TEXT, is_checked BOOLEAN, result BOOLEAN, response TEXT)", List())
    } yield ()

}
