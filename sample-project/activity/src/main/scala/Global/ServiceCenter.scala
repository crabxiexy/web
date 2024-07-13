package Global

import Global.GlobalVariables.serviceCode
import cats.effect.IO
import com.comcast.ip4s.Port
import org.http4s.Uri

object ServiceCenter {
  val projectName: String = "APP"

  val dbManagerServiceCode = "A000001"
  val doctorServiceCode = "A000002"
  val patientServiceCode = "A000003"
  val portalServiceCode = "A000004"
  val studentServiceCode = "A000005"
  val TAServiceCode = "A000006"
  val runServiceCode = "A000007"
  val adminServiceCode = "A00008"
  val leaderServiceCode = "A00009"
  val clubServiceCode = "A00015"
  val activityServiceCode = "A00016"

  val fullNameMap: Map[String, String] = Map(
    dbManagerServiceCode -> "数据库管理（DB_Manager）",
    doctorServiceCode -> "医生（Doctor）",
    patientServiceCode -> "病人（Patient）",
    portalServiceCode -> "门户（Portal）",
    studentServiceCode -> "学生（Student）",
    TAServiceCode -> "助教（TA）",
    runServiceCode -> "阳光长跑（Run）",
    adminServiceCode -> "管理员（Admin）",
    leaderServiceCode -> "队长（Leader）",
    clubServiceCode -> "俱乐部（Club）",
    activityServiceCode -> "社团活动（activity）"
  )

  val address: Map[String, String] = Map(
    "DB-Manager" -> "127.0.0.1:10001",
    "Doctor" -> "127.0.0.1:10002",
    "Patient" -> "127.0.0.1:10003",
    "Portal" -> "127.0.0.1:10004",
    "Student" -> "127.0.0.1:10005",
    "TA" -> "127.0.0.1:10006",
    "Run" -> "127.0.0.1:10007",
    "Admin" -> "127.0.0.1:10008",
    "Leader" -> "127.0.0.1:10009",
    "Club" -> "127.0.0.1:10015",
    "Activity" -> "127.0.0.1:10016"
  )
}
