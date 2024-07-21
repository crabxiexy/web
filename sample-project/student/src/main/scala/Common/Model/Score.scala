package Common.Model
import io.circe._
import io.circe.generic.semiauto._
case class Score(
                    run:Int,
                    groupex:Int,
                    activity:Int,
                    total:Int
                  )
object Score {
  implicit val decoder: Decoder[Score] = deriveDecoder[Score]
  given Encoder[Score] = Encoder.forProduct4("run", "groupex", "activity","total")(s =>
    (s.run, s.groupex, s.activity, s.total)
  )
}