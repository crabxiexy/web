package Common.Model

import io.circe.*
import io.circe.generic.semiauto.*
case class Notification(
                         notificationID: Int,
                         releaseTime: String,
                         content: String,
                         sender: UserInfo,
                         receiver: UserInfo,
                         checked: Int
                       )
object Notification {
  implicit val decoder: Decoder[Notification] = deriveDecoder[Notification]
  implicit val encoder: Encoder[Notification] = deriveEncoder[Notification]
}