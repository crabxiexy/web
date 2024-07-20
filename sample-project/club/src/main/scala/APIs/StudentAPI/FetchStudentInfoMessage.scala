package APIs.StudentAPI

import Common.Model.Student
import io.circe.*
import io.circe.generic.semiauto.*
case class FetchStudentInfoMessage(studentId: Int) extends StudentMessage[List[Json]]


object FetchStudentInfoMessage {
  implicit val encoder: Encoder[FetchStudentInfoMessage] = deriveEncoder[FetchStudentInfoMessage]
}

