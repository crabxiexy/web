package APIs.ClubAPI

import Common.API.API
import Global.ServiceCenter.clubServiceCode
import io.circe.Decoder

abstract class ClubMessage[ReturnType:Decoder] extends API[ReturnType](clubServiceCode)
