package APIs.StudentAPI

import Common.Model.Student
import io.circe._
import io.circe.generic.semiauto._

case class StudentRegisterMessage(val student: Student) extends StudentMessage[Student]
object StudentRegisterMessage {
  implicit val encoder: Encoder[StudentRegisterMessage] = deriveEncoder[StudentRegisterMessage]
}