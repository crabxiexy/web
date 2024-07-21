package APIs.UserAPI
import Common.Model.UserInfo
import io.circe.*
import io.circe.generic.semiauto.*
import io.circe.generic.auto.deriveDecoder
case class FetchUserInfoMessage(studentId: Int) extends UserMessage[UserInfo]

object FetchSUserInfoMessage {
  implicit val encoder: Encoder[FetchUserInfoMessage] = deriveEncoder[FetchUserInfoMessage]
}
