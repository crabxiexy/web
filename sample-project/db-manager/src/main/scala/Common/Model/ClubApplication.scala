package Common.Model

import io.circe.*
import io.circe.syntax.*

case class ClubApplication(
                        name: String,
                        leader: Student,
                        intro: String,
                        department: String,
                        isChecked: Int,
                        result: Int,
                        response: String
                      )

object ClubApplication {
  implicit val decoder: Decoder[ClubApplication] = new Decoder[ClubApplication] {
    final def apply(c: HCursor): Decoder.Result[ClubApplication] =
      for {
        name <- c.downField("name").as[String]
        leader <- c.downField("leader").as[Student]
        intro <- c.downField("intro").as[String]
        department <- c.downField("department").as[String]
        is_checked <- c.downField("isChecked").as[Int]
        result <- c.downField("result").as[Int]
        response <- c.downField("response").as[String]
      } yield ClubApplication(name, leader, intro, department, is_checked, result, response)
  }

  implicit val encoder: Encoder[ClubApplication] = new Encoder[ClubApplication] {
    final def apply(app: ClubApplication): Json = Json.obj(
      ("name", Json.fromString(app.name)),
      ("leader", app.leader.asJson),
      ("intro", Json.fromString(app.intro)),
      ("department", Json.fromString(app.department)),
      ("isChecked", Json.fromInt(app.isChecked)),
      ("result", Json.fromInt(app.result)),
      ("response", Json.fromString(app.response))
    )
  }
}