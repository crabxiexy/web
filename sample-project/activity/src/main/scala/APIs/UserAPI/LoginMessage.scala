package APIs.UserAPI

case class LoginMessage(student_id:Int, password: String, identity:Int) extends StudentMessage[String]
