package APIs.UserAPI

import APIs.UserAPI.UserInfo

case class QueryMessage(student_id:Int) extends DoctorMessage[(String, String, String)]
