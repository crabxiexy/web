package Common.Model
import io.circe._
import io.circe.generic.semiauto._
case class Student(
                    student_id: Int,
                    name: String,
                    profile: String,
                    TA_id: Int,
                    score: Score,
                    department: String,
                    class_name: String
                  )
object Student {
  implicit val decoder: Decoder[Student] = deriveDecoder[Student]
  given Encoder[Student] = Encoder.forProduct7("student_id", "name", "profile","TA_id", "score", "department", "class_name")(s =>
    (s.student_id, s.name, s.profile,s.TA_id, s.score, s.department, s.class_name)
  )
}
