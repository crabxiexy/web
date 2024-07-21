package APIs.GroupexAPI



import Common.API.API
import Global.ServiceCenter.groupexServiceCode
import io.circe.Decoder

abstract class GroupexMessage[ReturnType:Decoder] extends API[ReturnType](groupexServiceCode)