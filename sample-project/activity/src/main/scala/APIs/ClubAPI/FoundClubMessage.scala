package APIs.ClubAPI

case class FoundClubMessage(club_name: String, leader_name: String, club_intro: String, club_depart: String) extends ClubMessage[String]
