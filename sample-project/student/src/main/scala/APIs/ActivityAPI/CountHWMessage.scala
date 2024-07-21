package APIs.ActivityAPI
import APIs.ActivityAPI.ActivityMessage

case class CountHWMessage(student_id:Int) extends ActivityMessage[Int]