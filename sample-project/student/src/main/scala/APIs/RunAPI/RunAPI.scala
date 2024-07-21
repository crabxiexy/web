package APIs.RunAPI



import Common.API.API
import Global.ServiceCenter.runServiceCode
import io.circe.Decoder

abstract class RunMessage[ReturnType:Decoder] extends API[ReturnType](runServiceCode)