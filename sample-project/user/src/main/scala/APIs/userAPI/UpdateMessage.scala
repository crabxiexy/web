package APIs.UserAPI

case class UpdateMessage(student_id:Int, old_password:String, new_password:String) extends DoctorMessage[String]
