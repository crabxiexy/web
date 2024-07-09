package APIs.UserAPI


case class RegisterMessage(student_id:Int, name:String, password:String, identity:Int) extends StudentMessage[Int]
