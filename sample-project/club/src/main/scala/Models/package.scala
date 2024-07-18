package Common.Models

case class Club(
                 clubId: Int,
                 name: String,
                 leader: Int,
                 intro: String,
                 department: String,
                 profile: String,
                 members: List[Int]
               )