package APIs.ClubAPI

import io.circe.Json

case class QueryMemberMessage(club_name: String) extends ClubMessage[List[Json]]
