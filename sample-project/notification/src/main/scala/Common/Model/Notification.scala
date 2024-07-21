package Common.Model

import io.circe.*
import io.circe.generic.semiauto.*
case class Notification(
                         notificationID: Int,
                         releaseTime: String,
                         content: String,
                         sender: Student,
                         receiver: Student,
                         checked: Int
                       )
object Notification {
  implicit val decoder: Decoder[Notification] = deriveDecoder[Notification]
  implicit val encoder: Encoder[Notification] = deriveEncoder[Notification]
}