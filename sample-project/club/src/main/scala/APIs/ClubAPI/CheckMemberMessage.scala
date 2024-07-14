package APIs.ClubAPI

case class CheckMemberMessage(club_name: String, student_id: Int) extends ClubMessage[Boolean]
