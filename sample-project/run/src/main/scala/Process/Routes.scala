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
      case "SubmitRunningMessage" =>
        IO(decode[SubmitRunningPlanner](str).getOrElse(throw new Exception("Invalid JSON for SubmitRunningMessage")))
          .flatMap{m=>
            m.fullPlan.map(_.asJson.toString)
          }
      case "CheckRunningMessage" =>
        IO(decode[CheckRunningPlanner](str).getOrElse(throw new Exception("Invalid JSON for CheckRunningMessage")))
          .flatMap{m=>
            m.fullPlan.map(_.asJson.toString)
          }
      case "TAQueryRunningMessage" =>
        IO(decode[TAQueryPlanner](str).getOrElse(throw new Exception("Invalid JSON for TAQueryRunningMessage")))
          .flatMap(m =>
            m.fullPlan.map(_.asJson.toString)
          )
      case "StudentQueryRunningMessage" =>
        IO(decode[StudentQueryPlanner](str).getOrElse(throw new Exception("Invalid JSON for StudentQueryRunningMessage")))
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
