package APIs.DoctorAPI


case class RegisterMessage(student_id:Int, name:String, password:String, identity:Int) extends DoctorMessage[Int]
