package APIs.ClubAPI

case class CheckLeaderMessage(club_name: String, student_id: Int) extends ClubMessage[Boolean]
