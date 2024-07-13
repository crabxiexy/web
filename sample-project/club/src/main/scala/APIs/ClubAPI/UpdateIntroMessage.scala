package APIs.ClubAPI

case class UpdateIntroMessage(club_name: String, new_intro: String) extends ClubMessage[String]
