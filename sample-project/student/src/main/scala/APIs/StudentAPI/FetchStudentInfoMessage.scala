package APIs.StudentAPI

case class FetchStudentInfoAMessage(student_id: Int) extends StudentMessage[Int]