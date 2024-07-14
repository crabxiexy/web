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
      _ <- writeDB(s"CREATE TABLE IF NOT EXISTS ${schemaName}.activity (activity_id INT, club_name TEXT, activity_name TEXT, intro TEXT, startTime TIMESTAMPTZ , finishTime TIMESTAMPTZ, organizor_id INT, lowLimit INT, upLimit INT, num INT) ", List())
      _ <- writeDB(s"CREATE TABLE IF NOT EXISTS ${schemaName}.member (activity_id INT, member_id INT) ", List())

    } yield ()

}
