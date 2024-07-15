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
      case "AssignTAMessage" =>
        IO(decode[AssignTAPlanner](str).getOrElse(throw new Exception("Invalid JSON for AssignTAMessage")))
          .flatMap{m=>
            m.fullPlan.map(_.asJson.toString)
          }
      case "AssignScoreMessage" =>
        IO(decode[AssignScorePlanner](str).getOrElse(throw new Exception("Invalid JSON for AssignScoreMessage")))
          .flatMap{m=>
            m.fullPlan.map(_.asJson.toString)
          }
      case "AssignDepartmentMessage" =>
        IO(decode[AssignDepartmentPlanner](str).getOrElse(throw new Exception("Invalid JSON for AssignDepartmentMessage")))
          .flatMap{m=>
            m.fullPlan.map(_.asJson.toString)
          }
      case "AssignClassMessage" =>
        IO(decode[AssignClassPlanner](str).getOrElse(throw new Exception("Invalid JSON for AssignClassMessage")))
          .flatMap{m=>
            m.fullPlan.map(_.asJson.toString)
          }
      case "QueryNameMessage" =>
        IO(decode[QueryNamePlanner](str).getOrElse(throw new Exception("Invalid JSON for QueryClassMessage")))
          .flatMap{m=>
            m.fullPlan.map(_.asJson.toString)
          }
      case "QueryDepartmentMessage" =>
        IO(decode[QueryDepartmentPlanner](str).getOrElse(throw new Exception("Invalid JSON for QueryDepartmentMessage")))
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
