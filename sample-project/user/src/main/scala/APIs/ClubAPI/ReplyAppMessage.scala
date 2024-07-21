package APIs.ClubAPI

import io.circe.Json

case class ReplyAppMessage(club_name: String, result: Int, response: String) extends ClubMessage[List[Json]]
