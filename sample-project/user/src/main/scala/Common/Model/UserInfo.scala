package Common.Model

import io.circe.*
import io.circe.generic.semiauto.*
case class UserInfo(
                     UserID: Int,
                     name: String,
                     profile: String,

                   )
object User {
  implicit val decoder: Decoder[UserInfo] = deriveDecoder[UserInfo]
  implicit val encoder: Encoder[UserInfo] = deriveEncoder[UserInfo]
}
