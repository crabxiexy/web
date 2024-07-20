package APIs.StudentAPI

import Common.Model.Student
import io.circe.*
import io.circe.generic.semiauto.*
case class FetchStudentInfoMessage(studentID: Int) extends StudentMessage[List[Student]]


object FetchStudentInfoMessage {
  implicit val encoder: Encoder[FetchStudentInfoMessage] = deriveEncoder[FetchStudentInfoMessage]
}

