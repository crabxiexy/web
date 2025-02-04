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
      case "CreateActivityMessage" =>
        IO(decode[CreateActivityPlanner](str).getOrElse(throw new Exception("Invalid JSON for CreateActivityMessage")))
          .flatMap{m=>
            m.fullPlan.map(_.asJson.toString)
          }
      case "JoinActivityMessage" =>
        IO(decode[JoinActivityPlanner](str).getOrElse(throw new Exception("Invalid JSON for JoinActivityMessage")))
          .flatMap{m=>
            m.fullPlan.map(_.asJson.toString)
          }
      case "MemberQueryActivityMessage" =>
        IO(decode[MemberQueryActivityPlanner](str).getOrElse(throw new Exception("Invalid JSON for MemberQueryActivityMessage")))
          .flatMap{m=>
            m.fullPlan.map(_.asJson.toString)
          }
      case "StudentQueryHWMessage" =>
        IO(decode[StudentQueryHWPlanner](str).getOrElse(throw new Exception("Invalid JSON for MemberQueryActivityMessage")))
          .flatMap{m=>
            m.fullPlan.map(_.asJson.toString)
          }
      case "OrganizorQueryActivityMessage" =>
        IO(decode[OrganizorQueryActivityPlanner](str).getOrElse(throw new Exception("Invalid JSON for OrganizorQueryActivityMessage")))
          .flatMap{m=>
            m.fullPlan.map(_.asJson.toString)
          }
      case "ShowActivityMessage" =>
        IO(decode[ShowActivityPlanner](str).getOrElse(throw new Exception("Invalid JSON for OrganizorQueryActivityMessage")))
          .flatMap{m=>
            m.fullPlan.map(_.asJson.toString)
          }
      case "QueryMemberMessage" =>
        IO(decode[QueryMemberPlanner](str).getOrElse(throw new Exception("Invalid JSON for OrganizorQueryMemberMessage")))
          .flatMap{m=>
            m.fullPlan.map(_.asJson.toString)
          }

      case "SubmitHWMessage" =>
        IO(decode[SubmitHWPlanner](str).getOrElse(throw new Exception("Invalid JSON for SubmitHWMessage")))
          .flatMap { m =>
            m.fullPlan.map(_.asJson.toString)
          }
      case "CountHWMessage" =>
        IO(decode[CountHWPlanner](str).getOrElse(throw new Exception("Invalid JSON for CountHWMessage")))
          .flatMap { m =>
            m.fullPlan.map(_.asJson.toString)
          }
      case "TAQueryHWMessage" =>
        IO(decode[TAQueryHWPlanner](str).getOrElse(throw new Exception("Invalid JSON for TAQueryHWMessage")))
          .flatMap{m=>
            m.fullPlan.map(_.asJson.toString)
          }
      case "CheckHWMessage" =>
        IO(decode[CheckHWPlanner](str).getOrElse(throw new Exception("Invalid JSON for CheckHWMessage")))
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
