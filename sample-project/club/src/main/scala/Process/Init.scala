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
      _ <- writeDB(s"CREATE TABLE IF NOT EXISTS ${schemaName}.info (club_id INT, name TEXT, leader INT, intro TEXT, department TEXT, profile TEXT)", List())
      _ <- writeDB(s"CREATE TABLE IF NOT EXISTS ${schemaName}.member (club_name TEXT, member INT)", List())
      _ <- writeDB(s"CREATE TABLE IF NOT EXISTS ${schemaName}.application (name TEXT, leader INT, intro TEXT, department TEXT, is_checked INT, result INT, response TEXT)", List())
      _ <- writeDB(s"CREATE TABLE IF NOT EXISTS ${schemaName}.student_application (student_id INT, club_name TEXT, is_checked INT, result INT)", List())
      _ <- writeDB(s"CREATE TABLE IF NOT EXISTS ${schemaName}.photo (club_name TEXT, uploader_id INT, image TEXT, submit_time TIMESTAMPTZ)", List())
    } yield ()

}
