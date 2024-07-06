package APIs.DoctorAPI

case class LoginMessage(student_id:Int, password: String, identity:Int) extends DoctorMessage[String]
