package APIs.UserAPI

case class AddPatientMessage(doctorName:String, patientName:String) extends StudentMessage[String]
