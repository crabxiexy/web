package APIs.ClubAPI

import Common.Model.Club
import io.circe.generic.semiauto.deriveEncoder
import io.circe.{Encoder, Json}
case class FetchClubInfoMessage(club_name:String) extends ClubMessage[Club]

object FetchClubInfoMessage {
  implicit val encoder: Encoder[FetchClubInfoMessage] = deriveEncoder[FetchClubInfoMessage]
}

