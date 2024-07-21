package APIs.UserAPI
import Common.API.API
import Global.ServiceCenter.doctorServiceCode
import io.circe.Decoder

abstract class UserMessage[ReturnType:Decoder] extends API[ReturnType](doctorServiceCode)
