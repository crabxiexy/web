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


object Routes:
  private def executePlan(messageType:String, str: String): IO[String]=
    messageType match {
      case "LoginMessage" =>
        IO(decode[LoginMessagePlanner](str).getOrElse(throw new Exception("Invalid JSON for LoginMessage")))
          .flatMap{m=>
            m.fullPlan.map(_.asJson.toString)
          }
      case "FetchUserInfoMessage" =>
        IO(decode[FetchUserInfoPlanner](str).getOrElse(throw new Exception("Invalid JSON for FetchUserInfoMessage")))
          .flatMap{m=>
            m.fullPlan.map(_.asJson.toString)
          }
      case "UpdateProfileMessage" =>
        IO(decode[UpdateProfilePlanner](str).getOrElse(throw new Exception("Invalid JSON for UpdateProfileMessage")))
          .flatMap{m=>
            m.fullPlan.map(_.asJson.toString)
          }
      case "RegisterMessage" =>
        IO(decode[RegisterMessagePlanner](str).getOrElse(throw new Exception("Invalid JSON for RegisterMessage")))
          .flatMap{m=>
            m.fullPlan.map(_.asJson.toString)
          }
      case "RenameMessage" =>
        IO(decode[UpdatePasswordPlanner](str).getOrElse(throw new Exception("Invalid JSON for RenameMessage")))
          .flatMap{m=>
            m.fullPlan.map(_.asJson.toString)
          }
      case "FetchNameMessage" =>
        IO(decode[FetchNamePlanner](str).getOrElse(throw new Exception("Invalid JSON for FetchNameMessage")))
          .flatMap{m=>
            m.fullPlan.map(_.asJson.toString)
          }
      case "FetchProfileMessage" =>
        IO(decode[FetchProfilePlanner](str).getOrElse(throw new Exception("Invalid JSON for FetchProfileMessage")))
          .flatMap{m=>
            m.fullPlan.map(_.asJson.toString)
          }
      case "DeleteMessage" =>
        IO(decode[DeleteMessagePlanner](str).getOrElse(throw new Exception("Invalid JSON for DeleteMessage")))
          .flatMap{m=>
            m.fullPlan.map(_.asJson.toString)
          }
      case "CheckTokenMessage" =>
        IO(decode[CheckTokenPlanner](str).getOrElse(throw new Exception("Invalid JSON for CheckTokenMessage")))
          .flatMap { m =>
            m.fullPlan.map(_.asJson.toString)
          }
      case "QueryMessage" =>
        IO(decode[QueryMessagePlanner](str).getOrElse(throw new Exception("Invalid JSON for PatientQueryMessage")))
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
