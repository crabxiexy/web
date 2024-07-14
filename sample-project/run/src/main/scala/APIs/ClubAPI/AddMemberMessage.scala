package APIs.ClubAPI

case class AddMemberMessage(club_name: String, member_id: Int) extends ClubMessage[String]
