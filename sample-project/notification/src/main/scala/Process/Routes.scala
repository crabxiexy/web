package Process

import Common.API.PlanContext
import Impl.*
import cats.effect.*
import io.circe.generic.auto.*
import io.circe.parser.decode
import io.circe.syntax.*
import org.http4s.*
import org.http4s.client.Client
import org.http4s.dsl.io.*
import java.util.Date
import java.util.Base64
import io.circe.{Decoder, HCursor}

implicit val dateDecoder: Decoder[Date] = Decoder.decodeLong.map(l => new Date(l))


object Routes:
  private def executePlan(messageType:String, str: String): IO[String]=
    messageType match {
      case "QueryReceivedMessage" =>
        IO(decode[QueryReceivedPlanner](str).getOrElse(throw new Exception("Invalid JSON for QueryReceivedMessage")))
          .flatMap(m =>
            m.fullPlan.map(_.asJson.toString)
          )
      case "DeleteNotificationMessage" =>
        IO(decode[DeleteNotificationPlanner](str).getOrElse(throw new Exception("Invalid JSON for DeleteNotificationMessage")))
          .flatMap(m =>
            m.fullPlan.map(_.asJson.toString)
          )
      case "ReleaseNotificationMessage" =>
        IO(decode[ReleaseNotificationPlanner](str).getOrElse(throw new Exception("Invalid JSON for ReleaseNotificationMessage")))
          .flatMap(m =>
            m.fullPlan.map(_.asJson.toString)
          )
      case "QueryReceivedPlanner" =>
          IO(decode[QueryReceivedPlanner](str).getOrElse(throw new Exception("Invalid JSON for QueryReceivedMessage")))
          .flatMap(m =>
            m.fullPlan.map(_.asJson.toString)
          )
      case "CheckNotificationPlanner" =>
        IO(decode[QueryReceivedPlanner](str).getOrElse(throw new Exception("Invalid JSON for QueryReceivedMessage")))
          .flatMap(m =>
            m.fullPlan.map(_.asJson.toString)
          )
      case "QuerySentPlanner" =>
        IO(decode[QuerySentPlanner](str).getOrElse(throw new Exception("Invalid JSON for QuerySentMessage")))
          .flatMap(m =>
            m.fullPlan.map(_.asJson.toString)
          )
      case _ =>
        IO.raiseError(new Exception(s"Unknown type: $messageType"))
    }

  val service: HttpRoutes[IO] = HttpRoutes.of[IO]:
    case req @ POST -> Root / "api" / name =>
        println("request received")
        req.as[String].flatMap{executePlan(name, _)}.flatMap(Ok(_))
        .handleErrorWith{e =>
          println(e)
          BadRequest(e.getMessage)
        }
