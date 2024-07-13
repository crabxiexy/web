package APIs.ClubAPI

case class AddMemberMessage(club_name: String, member_name: String) extends ClubMessage[String]
