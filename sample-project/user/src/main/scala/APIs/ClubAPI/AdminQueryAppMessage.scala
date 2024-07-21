package APIs.ClubAPI

import io.circe.Json

case class AdminQueryAppMessage(is_checked: Boolean) extends ClubMessage[List[Json]]
