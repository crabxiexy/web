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
      case "FoundClubMessage" =>
        IO(decode[FoundClubPlanner](str).getOrElse(throw new Exception("Invalid JSON for FoundClubMessage")))
          .flatMap{m=>
            m.fullPlan.map(_.asJson.toString)
          }
      case "AddMemberMessage" =>
        IO(decode[AddMemberPlanner](str).getOrElse(throw new Exception("Invalid JSON for AddMemberMessage")))
          .flatMap{m=>
            m.fullPlan.map(_.asJson.toString)
          }
      case "LeaderQueryMessage" =>
        IO(decode[LeaderQueryPlanner](str).getOrElse(throw new Exception("Invalid JSON for LeaderQueryMessage")))
          .flatMap{m=>
            m.fullPlan.map(_.asJson.toString)
          }
      case "CreateAppMessage" =>
        IO(decode[CreateAppPlanner](str).getOrElse(throw new Exception("Invalid JSON for CreateAppMessage")))
          .flatMap{m=>
            m.fullPlan.map(_.asJson.toString)
          }
      case "QueryMemberMessage" =>
        IO(decode[QueryMemberPlanner](str).getOrElse(throw new Exception("Invalid JSON for QueryMemberMessage")))
          .flatMap{m=>
            m.fullPlan.map(_.asJson.toString)
          }
      case "UpdateIntroMessage" =>
        IO(decode[UpdateIntroPlanner](str).getOrElse(throw new Exception("Invalid JSON for UpdateIntroMessage")))
          .flatMap{m=>
            m.fullPlan.map(_.asJson.toString)
          }
      case "AdminQueryAppMessage" =>
        IO(decode[AdminQueryAppPlanner](str).getOrElse(throw new Exception("Invalid JSON for AdminQueryAppMessage")))
          .flatMap{m=>
            m.fullPlan.map(_.asJson.toString)
          }
      case "LeaderQueryAppMessage" =>
        IO(decode[LeaderQueryAppPlanner](str).getOrElse(throw new Exception("Invalid JSON for LeaderQueryAppMessage")))
          .flatMap{m=>
            m.fullPlan.map(_.asJson.toString)
          }
      case "ReplyAppMessage" =>
        IO(decode[ReplyAppPlanner](str).getOrElse(throw new Exception("Invalid JSON for ReplyAppMessage")))
          .flatMap{m=>
            m.fullPlan.map(_.asJson.toString)
          }
      case "CheckClubMessage" =>
        IO(decode[CheckClubPlanner](str).getOrElse(throw new Exception("Invalid JSON for CheckClubMessage")))
<<<<<<< HEAD
=======
          .flatMap{m=>
            m.fullPlan.map(_.asJson.toString)
          }
      case "CheckAvailableMessage" =>
        IO(decode[CheckAvailablePlanner](str).getOrElse(throw new Exception("Invalid JSON for CheckClubMessage")))
>>>>>>> refs/remotes/origin/main
          .flatMap{m=>
            m.fullPlan.map(_.asJson.toString)
          }
      case "CheckMemberMessage" =>
<<<<<<< HEAD
        IO(decode[CheckMemberPlanner](str).getOrElse(throw new Exception("Invalid JSON for CheckMemberMessage")))
          .flatMap{m=>
            m.fullPlan.map(_.asJson.toString)
          }
      case "CheckLeaderMessage" =>
        IO(decode[CheckLeaderPlanner](str).getOrElse(throw new Exception("Invalid JSON for CheckLeaderMessage")))
=======
        IO(decode[CheckAvailablePlanner](str).getOrElse(throw new Exception("Invalid JSON for ReplyAppMessage")))
>>>>>>> refs/remotes/origin/main
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
