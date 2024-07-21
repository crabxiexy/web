package Common.Model

import io.circe.*
import io.circe.generic.semiauto.*
import io.circe.syntax.*

case class TA(
                    taID: Int,
                    students:List[Student]
                  )
object TA {
  implicit val decoder: Decoder[TA] = deriveDecoder[TA]
  implicit val encoder: Encoder[TA] = deriveEncoder[TA]
}
