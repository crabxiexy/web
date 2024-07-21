package APIs.ClubAPI

import io.circe.{Encoder, Json}
import Common.Model.Club
import io.circe.generic.semiauto.deriveEncoder
case class FetchClubInfoMessage(club_name:String) extends ClubMessage[Club]

object FetchClubInfoMessage {
  implicit val encoder: Encoder[FetchClubInfoMessage] = deriveEncoder[FetchClubInfoMessage]
}

