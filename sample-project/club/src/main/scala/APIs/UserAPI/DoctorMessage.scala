package APIs.UserAPI

import APIs.UserAPI.UserInfo
import Common.API.API
import Global.ServiceCenter.doctorServiceCode
import io.circe.Decoder

abstract class DoctorMessage[ReturnType:Decoder] extends API[ReturnType](doctorServiceCode)
