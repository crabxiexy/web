package Impl

import cats.effect.IO
import io.circe.generic.auto.*
import Common.API.{PlanContext, Planner}
import Common.DBAPI.*
import Common.Object.{ParameterList, SqlParameter}

//这个函数返回了一个巨大的 json,希望可以在前端解开
case class TAQueryPlanner(
                           TA_id: Int,
                           override val planContext: PlanContext
                         ) extends Planner[String] {
  override def plan(using planContext: PlanContext): IO[String] = {
    val checkTAExists = readDBBoolean(s"SELECT EXISTS(SELECT 1 FROM TA.TA WHERE TA_id = ?)",
      List(SqlParameter("Int", TA_id.toString))
    )
    // 查找TA_id对应的所有groupex_id
    checkTAExists.flatMap { exists =>
      if (!exists) {
        IO.raiseError(new Exception("TA not found!"))
      } else {
        val getGroupexIdsForTA = readDBString(
          s"SELECT groupex_id AND startTime AND finishTime AND location AND sign_in AND sign_out AND token FROM groupex.groupex WHERE TA_id = ?",
          List(SqlParameter("Int", TA_id.toString))
        )
        getGroupexIdsForTA.flatMap { maybeGroupexInfo =>
          // 检查是否至少有一条数据
          if (maybeGroupexInfo.isEmpty) {
            IO.pure("No group exercise found!")
          } else {
            //如果有数据，则返回这些数据
            IO.pure(maybeGroupexInfo)
          }
        }
      }
    }  
  }
}
