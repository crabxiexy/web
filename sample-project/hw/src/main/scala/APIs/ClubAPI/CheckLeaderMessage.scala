package APIs.ClubAPI

case class CheckLeaderMessage(club_name: String, leader_id: Int) extends ClubMessage[Boolean]
