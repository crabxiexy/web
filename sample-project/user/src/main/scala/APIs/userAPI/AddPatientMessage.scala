package APIs.UserAPI

case class AddPatientMessage(doctorName:String, patientName:String) extends DoctorMessage[String]
