package APIs.ClubAPI

case class CheckClubMessage(club_name: String) extends ClubMessage[Boolean]
