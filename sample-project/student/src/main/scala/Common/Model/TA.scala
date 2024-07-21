package Common.Model

import io.circe._
import io.circe.generic.semiauto._
import io.circe.syntax._

case class TA(
                    taID: Int,
                    students:List[Student]
                  )
object TA {
  implicit val decoder: Decoder[TA] = deriveDecoder[TA]
  implicit val encoder: Encoder[TA] = deriveEncoder[TA]
}
