package APIs.StudentAPI

import io.circe.Json

case class GetDepartmentStudentMessage(department:String) extends StudentMessage[List[Json]]
