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
import io.circe.generic.auto._

implicit val dateDecoder: Decoder[Date] = Decoder.decodeLong.map(l => new Date(l))
implicit val byteArrayDecoder: Decoder[Array[Byte]] = Decoder.decodeString.emap { str =>
  try {
    Right(Base64.getDecoder.decode(str))
  } catch {
    case _: IllegalArgumentException => Left("Invalid base64 encoding for byte array")
  }
}

object Routes:
  private def executePlan(messageType:String, str: String): IO[String]=
    messageType match {
      case "SubmitRunningMessage" =>
        IO(decode[SubmitRunningPlanner](str).getOrElse(throw new Exception("Invalid JSON for SubmitRunningMessage")))
          .flatMap{m=>
            m.fullPlan.map(_.asJson.toString)
          }
     
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
