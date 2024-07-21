package Common.Model

import io.circe._
import io.circe.syntax._

case class StudentApplication(
                               student: Student,
                               clubName: String,
                               isChecked: Int,
                               result: Int
                             )

object StudentApplication {
  implicit val decoder: Decoder[StudentApplication] = new Decoder[StudentApplication] {
    final def apply(c: HCursor): Decoder.Result[StudentApplication] =
      for {
        student <- c.downField("student").as[Student]
        club_name <- c.downField("clubName").as[String]
        is_checked <- c.downField("isChecked").as[Int]
        result <- c.downField("result").as[Int]
      } yield StudentApplication(student, club_name, is_checked, result)
  }

  implicit val encoder: Encoder[StudentApplication] = new Encoder[StudentApplication] {
    final def apply(sa: StudentApplication): Json = Json.obj(
      ("student", sa.student.asJson),
      ("clubName", Json.fromString(sa.clubName)),
      ("isChecked", Json.fromInt(sa.isChecked)),
      ("result", Json.fromInt(sa.result))
    )
  }
}