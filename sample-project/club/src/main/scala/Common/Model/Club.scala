package Common.Model

import io.circe._
import io.circe.syntax._

case class Club(
                 clubID: Int,
                 name: String,
                 leader: Student,
                 intro: String,
                 department: String,
                 profile: String,
                 members: List[Student]
               )

object Club {
  implicit val decoder: Decoder[Club] = new Decoder[Club] {
    final def apply(c: HCursor): Decoder.Result[Club] =
      for {
        club_id <- c.downField("clubID").as[Int]
        name <- c.downField("name").as[String]
        leader <- c.downField("leader").as[Student]
        intro <- c.downField("intro").as[String]
        department <- c.downField("department").as[String]
        profile <- c.downField("profile").as[String]
        members <- c.downField("members").as[List[Student]]
      } yield Club(club_id, name, leader, intro, department, profile, members)
  }

  implicit val encoder: Encoder[Club] = new Encoder[Club] {
    final def apply(c: Club): Json = Json.obj(
      ("clubID", Json.fromInt(c.clubID)),
      ("name", Json.fromString(c.name)),
      ("leader", c.leader.asJson),
      ("intro", Json.fromString(c.intro)),
      ("department", Json.fromString(c.department)),
      ("profile", Json.fromString(c.profile)),
      ("members", c.members.asJson)
    )
  }
}
