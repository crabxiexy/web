package APIs.StudentAPI

case class QueryNameMessage(student_id: Int) extends StudentMessage[Int]
