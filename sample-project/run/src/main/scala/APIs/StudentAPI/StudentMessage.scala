package APIs.StudentAPI

import Common.API.API
import Global.ServiceCenter.studentServiceCode
import io.circe.Decoder

abstract class StudentMessage[ReturnType:Decoder] extends API[ReturnType](studentServiceCode)
