
package Common.Model

import io.circe._
import io.circe.syntax._


case class Activity(
                     activityID: Int,
                     club:Club,
                     activityName: String,
                     intro: String,
                     startTime: String,
                     finishTime: String,
                     organizor:Student,
                     lowLimit: Int,
                     upLimit: Int,
                     num: Int,
                     members: List[Student]
                   )

object Activity {
  implicit val decoder: Decoder[Activity] = new Decoder[Activity] {
    final def apply(c: HCursor): Decoder.Result[Activity] =
      for {
        activityID <- c.downField("activityID").as[Int]
        club <- c.downField("club").as[Club]
        activityName <- c.downField("activityName").as[String]
        intro <- c.downField("intro").as[String]
        startTime <- c.downField("startTime").as[String]
        finishTime <- c.downField("finishTime").as[String]
        organizor<- c.downField("organizor").as[Student]
        lowLimit <- c.downField("lowLimit").as[Int]
        upLimit <- c.downField("upLimit").as[Int]
        num <- c.downField("num").as[Int]
        members <- c.downField("members").as[List[Student]]
      } yield Activity(activityID, club, activityName, intro, startTime, finishTime, organizor, lowLimit, upLimit, num, members)
  }

  implicit val encoder: Encoder[Activity] = new Encoder[Activity] {
    final def apply(a: Activity): Json = Json.obj(
      ("activityID", Json.fromInt(a.activityID)),
      ("club", a.club.asJson),
      ("activityName", Json.fromString(a.activityName)),
      ("intro", Json.fromString(a.intro)),
      ("startTime", a.startTime.asJson),
      ("finishTime", a.finishTime.asJson),
      ("organizor", a.organizor.asJson),
      ("lowLimit", Json.fromInt(a.lowLimit)),
      ("upLimit", Json.fromInt(a.upLimit)),
      ("num", Json.fromInt(a.num)),
      ("members", a.members.asJson)
    )
  }
}