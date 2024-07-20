package APIs.StudentAPI
import Common.Model.Student
import io.circe._
import io.circe.generic.semiauto._

case class FetchStudentInfoMessage(student_id: Int) extends StudentMessage[Int]
  object FetchStudentInfoMessage {
  implicit val encoder: Encoder[FetchStudentInfoMessage] = deriveEncoder[FetchStudentInfoMessage]
}

