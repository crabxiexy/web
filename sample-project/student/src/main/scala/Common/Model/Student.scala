package Common.Model
import io.circe._
import io.circe.generic.semiauto._
case class Student(
                    studentID: Int,
                    name: String,
                    profile: String,
                    taID: Int,
                    score: Score,
                    department: String,
                    className: String
                  )
object Student {
  implicit val decoder: Decoder[Student] = deriveDecoder[Student]
  implicit val encoder: Encoder[Student] = deriveEncoder[Student]
  //  implicit val decoder: Decoder[Student] = new Decoder[Student] {
  //    final def apply(c: HCursor): Decoder.Result[Student] =
  //      for {
  //        studentID <- c.downField("studentID").as[Int]
  //        name <- c.downField("name").as[String]
  //        profile <- c.downField("profile").as[String]
  //        taID <- c.downField("taID").as[Int]
  //        department <- c.downField("department").as[String]
  //        score <- c.downField("score").as[Int]
  //        className <- c.downField("className").as[String]
  //      } yield Student(studentID, name, profile, taID, score, department, className)
  //  }
  //
  //
  //given Encoder[Student] = Encoder.forProduct7("studentID", "name", "profile","taID", "score", "department", "className")(s =>
  //    (s.studentID, s.name, s.profile, s.taID, s.score, s.department, s.className)
  //  )
}
