package APIs.StudentAPI

case class RegisterMessage(student_id: Int) extends StudentMessage[String]
