package Common.DBAPI

import Common.API.API
import Common.Object.SqlParameter
import Global.ServiceCenter.dbManagerServiceCode
import io.circe.Json
import io.circe._
import io.circe.generic.semiauto._
// Assuming Row and TraceID are defined elsewhere
case class ReadDBRowsMessage(sqlQuery: String, parameters: List[SqlParameter]) extends API[List[Json]](dbManagerServiceCode)
object ReadDBRowsMessage {
  implicit val encoder: Encoder[ReadDBRowsMessage] = deriveEncoder
  implicit val decoder: Decoder[ReadDBRowsMessage] = deriveDecoder
}