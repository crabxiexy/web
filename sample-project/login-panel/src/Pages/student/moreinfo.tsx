import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import useClubNameStore from 'Pages/student/ClubNameStore';
import { ShowActivityMessage } from 'Plugins/ActivityAPI/ShowActivityMessage';
import { FetchNameMessage } from 'Plugins/DoctorAPI/FetchNameMessage';
import { FetchProfileMessage } from 'Plugins/DoctorAPI/FetchProfileMessage';
import useIdStore from 'Pages/IdStore';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import { QueryMemberMessage } from 'Plugins/ActivityAPI/QueryMemberMessage';

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
    members: Member[]; // Changed from number[] to Member[]
}

export const MoreInfo: React.FC = () => {
    const history = useHistory();
    const { ClubName } = useClubNameStore();
    const { Id } = useIdStore();
    const [activities, setActivities] = useState<Activity[]>([]);
    const [error, setError] = useState<string>('');

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
                        members: memberDetails, // Now members are of type Member[]
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
                const memberId = memberObject.memberID; // Extract memberID
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

    const handleSubmitHomework = async (activityID: number) => {
        // 这里可以添加提交作业的逻辑
        try {
            // 提交作业的请求逻辑
            await sendPostRequest(/* 提交作业的消息 */);
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

                        {/* 提交作业按钮 */}
                        <button onClick={() => handleSubmitHomework(activity.activityID)}>
                            提交作业
                        </button>
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
