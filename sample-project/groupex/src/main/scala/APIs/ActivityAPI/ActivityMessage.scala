package APIs.ActivityAPI

import Common.API.API
import Global.ServiceCenter.activityServiceCode
import io.circe.Decoder

abstract class ActivityMessage[ReturnType:Decoder] extends API[ReturnType](activityServiceCode)