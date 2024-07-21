package Common.Model

import io.circe.*
import io.circe.generic.semiauto.*

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

  given Encoder[Student] = Encoder.forProduct7("studentID", "name", "profile", "taID", "score", "department", "className")(s =>
    (s.studentID, s.name, s.profile, s.taID, s.score, s.department, s.className)
  )
}