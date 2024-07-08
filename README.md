Web!

Peiqi Duan, Yihan Xu, Chenxiao Yang and Xuanyi Xie

User table:
user (id INT, name TEXT, password TEXT, student_id INT, identity TEXT, authority1 BOOLEAN, authority2 BOOLEAN, authority3 BOOLEAN, authority4 BOOLEAN, authority5 BOOLEAN)


Register(RegisterMessage): student_id, name, password, identity(int)

Login(LoginMessage): student_id, password, identity

Delete(DeleteMessage): student_id

Rename(RenameMessage): student_id, old_password, new_password

创建一个新的type:
改build.sbt里的name
改server_config里的serverPort
改Global/GlobalVariables和ServiceCenter
全局找doctor干掉

系统描述：
学生：学校里的学生，包括学号、姓名、对应的助教、参加的体育代表队、集体锻炼次数
助教：管理体育锻炼的助教，包括编号（助教一般也是校内学生，所以可以直接用学号）、姓名、管理的学生
俱乐部部长：管理俱乐部的学生，包括学号、姓名、管理的体育代表队名称
阳光长跑作业：学生向助教提交的阳光长跑作业、包括编号、提交的学生姓名、作为提交对象的助教姓名、凭证、时间戳、助教是否审批
集体锻炼作业：由助教布置学生通过填写口令完成签到的作业，包括编号、口令、有效与否、作为提交对象的助教姓名、完成签到的学生姓名
体育俱乐部：包括名称、管理者、学生成员
体育活动：由俱乐部举办的活动，包括俱乐部、时间地点、活动管理者、名额限制、报名人员
体育活动作业：由体育代表队管理者发送给参与者助教的作业，包括编号、体育活动编号、对应的体育俱乐部、提交的俱乐部管理者、活动的参与者、凭证、时间戳、助教是否审批
公告：助教、体育代表队队长向学生发布的公告，包括内容、发送者、发送对象、时间戳
功能：
1、学生可以向助教提交阳光长跑作业登记阳光长跑
2、助教发布集体锻炼作业，学生在可签到时间内通过口令完成签到
3、学生可自由加入体育俱乐部，队长发布俱乐部活动，学生报名参加、在俱乐部活动完成后将俱乐部活动记录发送给学生对应的助教
4、学生可直接查看集体锻炼次数与集体锻炼记录
5、助教可直接查看所管理学生的集体锻炼次数和集体锻炼记录

阳光长跑首先需要三个type 学生助教和阳光长跑作业 然后首先助教可以查看所有学生（这个要接口吗 我不知道）并且和部分学生绑定（输入学生id、助教id，改两个库的数据），学生可以发送阳光长跑作业（输入学生id，timestanp，凭证，审核（发送时默认为未审核），同时自动调取学生对应的助教id，助教可以查看学生提交的阳光长跑作业，输入助教id和审核情况返回学生id，timestamp，凭证，然后改审核情况（输入作业id，新的审核状态），最后学生端通过可以查看自己提交记录（输入学生id返回作业id，timestamp，凭证，审核情况）并按已审核计次

创建一个新的type:
改build.sbt里的name
改server_config里的serverPort
改Global/GlobalVariables和ServiceCenter
全局找doctor干掉
