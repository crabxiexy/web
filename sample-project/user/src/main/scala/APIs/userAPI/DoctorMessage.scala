package APIs.UserAPI

import Common.API.API
import Global.ServiceCenter.doctorServiceCode
import io.circe.Decoder
import APIs.UserAPI.UserInfo

abstract class DoctorMessage[ReturnType:Decoder] extends API[ReturnType](doctorServiceCode)
