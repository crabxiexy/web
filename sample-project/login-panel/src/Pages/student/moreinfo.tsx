import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import useClubNameStore from 'Pages/student/ClubNameStore';
import { ShowActivityMessage } from 'Plugins/ActivityAPI/ShowActivityMessage';
import { FetchNameMessage } from 'Plugins/DoctorAPI/FetchNameMessage';
import { FetchProfileMessage } from 'Plugins/DoctorAPI/FetchProfileMessage';
import useIdStore from 'Pages/IdStore';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import { QueryMemberMessage } from 'Plugins/ActivityAPI/QueryMemberMessage';
import { SubmitHWMessage } from 'Plugins/ActivityAPI/SubmitHWMessage';
import { GetTAMessage } from 'Plugins/StudentAPI/GetTAMessage';

interface Member {
    memberId: number;
    name: string;
    profile: string;
}

interface Activity {
    activityID: number;
    activityName: string;
    intro: string;
    starttime: string;
    finishtime: string;
    lowlimit: number;
    uplimit: number;
    members: Member[];
}

export const MoreInfo: React.FC = () => {
    const history = useHistory();
    const { ClubName } = useClubNameStore();
    const { Id } = useIdStore();
    const [activities, setActivities] = useState<Activity[]>([]);
    const [error, setError] = useState<string>('');
    const [studentId, setStudentId] = useState('');
    const [imgUrl, setImgUrl] = useState('');

    useEffect(() => {
        fetchActivities();
    }, [ClubName]);

    const fetchActivities = async () => {
        try {
            const activitiesResponse = await sendPostRequest(new ShowActivityMessage(ClubName));
            const activitiesWithMembers = await Promise.all(
                activitiesResponse.data.map(async (activity: any) => {
                    const memberDetails = await fetchMemberDetails(activity.activityID);
                    return {
                        ...activity,
                        members: memberDetails,
                    };
                })
            );
            setActivities(activitiesWithMembers);
        } catch (error) {
            setError('加载活动信息失败，请重试。');
        }
    };

    const fetchMemberDetails = async (activityID: number): Promise<Member[]> => {
        const memberResponse = await sendPostRequest(new QueryMemberMessage(activityID));
        return Promise.all(
            memberResponse.data.map(async (memberObject: { memberID: number }) => {
                const memberId = memberObject.memberID;
                const [nameResponse, profileResponse] = await Promise.all([
                    sendPostRequest(new FetchNameMessage(memberId)),
                    sendPostRequest(new FetchProfileMessage(memberId)),
                ]);
                return {
                    memberId,
                    name: nameResponse.data,
                    profile: profileResponse.data,
                };
            })
        );
    };

    const handleBack = () => {
        history.goBack();
    };


    const handleSubmitHomework = async (activityID: number ) => {
        try {
            const taMessageResponse = await sendPostRequest(new GetTAMessage(parseInt(Id))); // 获取 TA_id
            const taMessage = taMessageResponse.data;

            const studentId = prompt('请输入您的学生ID:');
            const imgUrl = prompt('请输入作业图片链接:');
            const submitMessage = new SubmitHWMessage(activityID, parseInt(Id), taMessage.TA_id, Date.now(), imgUrl); // 构建提交作业消息

            await sendPostRequest(submitMessage); // 发送提交作业请求

            alert('作业提交成功！');
        } catch (error) {
            setError('提交作业失败，请重试。');
        }
    };

    return (
        <div className="more-info">
            <h1>所有活动</h1>
            {error && <p className="error-message">{error}</p>}
            {activities.length > 0 ? (
                activities.map((activity: Activity) => (
                    <div key={activity.activityID} className="activity-details">
                        <p><strong>活动名称:</strong> {activity.activityName}</p>
                        <p><strong>开始时间:</strong> {new Date(parseInt(activity.starttime)).toLocaleString()}</p>
                        <p><strong>结束时间:</strong> {new Date(parseInt(activity.finishtime)).toLocaleString()}</p>
                        <p><strong>人数限制:</strong> {activity.lowlimit} - {activity.uplimit}</p>

                        <h4>参与成员:</h4>
                        {activity.members.map((member: Member) => (
                            <div key={member.memberId} className="member-info">
                                <div className="profile-circle">
                                    <img
                                        src={member.profile}
                                        alt={member.name}
                                        className="member-profile-img"
                                    />
                                </div>
                                <span>{member.name}</span>
                            </div>
                        ))}

                        <div className="modal">
                            <div className="modal-content">
                                <h2>提交作业</h2>
                                <label>
                                    学生ID:
                                    <input
                                        type="text"
                                        value={0}
                                        onChange={(e) => setStudentId(e.target.value)}
                                    />
                                </label>
                                <label>
                                    作业图片链接:
                                    <input
                                        type="text"
                                        value={imgUrl}
                                        onChange={(e) => setImgUrl(e.target.value)}
                                    />
                                </label>
                                <button onClick={handleSubmitHomework}>提交作业</button>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <p>没有活动信息可显示。</p>
            )}
            <button className="back-button" onClick={handleBack}>
                返回
            </button>
        </div>
    );
};

export default MoreInfo;
