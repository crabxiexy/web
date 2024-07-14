package APIs.ClubAPI

import io.circe.Json

case class LeaderQueryAppMessage(leader_id: Int) extends ClubMessage[List[Json]]
