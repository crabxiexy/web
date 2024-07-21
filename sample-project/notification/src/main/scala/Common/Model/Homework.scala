package Common.Model

import java.time.Instant

case class Homework(
                     activityId: Int,
                     students: List[Student],  // Replaces student_id with List[Student]
                     TAId: Int,
                     submitTime: Instant,
                     imgUrl: Option[String],
                     isChecked: Boolean,
                     response: Option[String]
                   )