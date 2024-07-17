import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import useClubNameStore from 'Pages/student/ClubNameStore';
import { FetchInfoMessage } from 'Plugins/ClubAPI/FetchInfoMessage';
import { FetchNameMessage } from 'Plugins/DoctorAPI/FetchNameMessage';
import { FetchProfileMessage } from 'Plugins/DoctorAPI/FetchProfileMessage';
import { QueryMemberMessage } from 'Plugins/ClubAPI/QueryMemberMessage';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import { MemberQueryActivityMessage } from 'Plugins/ActivityAPI/MemberQueryActivityMessage';
import { JoinActivityMessage } from 'Plugins/ActivityAPI/JoinActivityMessage';
import student_myclub_style from './manageclub.module.css';
import useIdStore from 'Pages/IdStore';

interface Member {
    student_id: number;
    member: number; // Assuming member is an ID of type number
}

interface ClubInfo {
    name: string;
    intro: string;
    leader: number;
}

interface Activity {
    activityID: number;
    clubName: string;
    activityName: string;
    intro: string;
    starttime: string;
    finishtime: string;
    organizorID: number;
    lowLimit: number;
    upLimit: number;
    num: number;
}

export const MyClubInfo: React.FC = () => {
    const history = useHistory();
    const { ClubName, setClubName } = useClubNameStore();
    const { Id } = useIdStore();
    const studentIdNumber = parseInt(Id);
    const [clubInfo, setClubInfo] = useState<ClubInfo | null>(null);
    const [leaderInfo, setLeaderInfo] = useState<{ name: string; profile: string } | null>(null);
    const [members, setMembers] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [allMembers, setAllMembers] = useState<any[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [error, setError] = useState<string>('');
    const [viewMode, setViewMode] = useState<'available' | 'joined'>('available');

    useEffect(() => {
        fetchClubInfo();
        fetchActivities('available');
    }, [ClubName]);

    const fetchClubInfo = async () => {
        try {
            const infoResponse = await sendPostRequest(new FetchInfoMessage(ClubName));
            const clubData = infoResponse.data[0];
            setClubInfo(clubData);

            const leaderId = clubData?.leader;
            if (leaderId) {
                const leaderNameResponse = await sendPostRequest(new FetchNameMessage(leaderId));
                const leaderProfileResponse = await sendPostRequest(new FetchProfileMessage(leaderId));

                setLeaderInfo({
                    name: leaderNameResponse.data,
                    profile: leaderProfileResponse.data
                });
            }

            const membersResponse = await sendPostRequest(new QueryMemberMessage(ClubName));
            const membersData: Member[] = membersResponse.data;

            // Fetch names for each member
            const membersWithNames = await Promise.all(membersData.map(async (member: Member) => {
                const nameResponse = await sendPostRequest(new FetchNameMessage(member.member));
                const profileResponse = await sendPostRequest(new FetchProfileMessage(member.member));

                return {
                    student_id: member.student_id,
                    name: nameResponse.data,
                    profile: profileResponse.data,
                };
            }));

            setMembers(membersWithNames);
        } catch (error) {
            setError('加载俱乐部信息失败，请重试。');
        }
    };

    const fetchActivities = async (mode: 'available' | 'joined') => {
        try {
            const currentTime = new Date().toISOString();
            const currentTimestamp = new Date(currentTime).getTime();
            let activitiesResponse;
            if (mode === 'available') {
                activitiesResponse = await sendPostRequest(new MemberQueryActivityMessage(studentIdNumber, ClubName, currentTimestamp.toString(), 3, 1, 1));
            } else {
                activitiesResponse = await sendPostRequest(new MemberQueryActivityMessage(studentIdNumber, ClubName, currentTimestamp.toString(), 3, 0, 0));
            }
            setActivities(activitiesResponse.data);
        } catch (error) {
            setError('加载活动信息失败，请重试。');
        }
    };

    const handleJoinActivity = async (activityId: number) => {
        try {
            await sendPostRequest(new JoinActivityMessage(studentIdNumber, activityId));
            alert('成功加入活动！');
            fetchActivities(viewMode); // Refresh activities list
        } catch (error) {
            setError('加入活动失败，请重试。');
        }
    };

    const handleViewMoreMembers = async () => {
        setShowModal(true);
        const allMembersResponse = await sendPostRequest(new QueryMemberMessage(ClubName));
        const allMembersData: Member[] = allMembersResponse.data;

        // Fetch names for all members
        const allMembersWithNames = await Promise.all(allMembersData.map(async (member: Member) => {
            const nameResponse = await sendPostRequest(new FetchNameMessage(member.member));
            const profileResponse = await sendPostRequest(new FetchProfileMessage(member.member));

            return {
                student_id: member.student_id,
                name: nameResponse.data,
                profile: profileResponse.data,
            };
        }));

        setAllMembers(allMembersWithNames);
    };

    const handleBack = () => {
        setClubName(''); // Clear ClubName
        history.goBack();
    };

    const handleViewAvailableActivities = () => {
        setViewMode('available');
        fetchActivities('available');
    };

    const handleViewJoinedActivities = () => {
        setViewMode('joined');
        fetchActivities('joined');
    };

    return (
        <div className="managed-club-info">
            <h1>俱乐部信息</h1>
            {error && <p className="error-message">{error}</p>}
            {clubInfo && (
                <div className="club-details">
                    <h2>{clubInfo.name}</h2>
                    <p><strong>简介:</strong> {clubInfo.intro}</p>
                    <div className="leader-info">
                        <h3>负责人:</h3>
                        {leaderInfo && (
                            <div className="leader-details">
                                <div className="profile-circle">
                                    <img
                                        src={leaderInfo.profile}
                                        alt={leaderInfo.name}
                                        className="leader-profile-img"
                                    />
                                </div>
                                <span>{leaderInfo.name}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="member-list">
                <h3>成员:</h3>
                {members.slice(0, 5).map(member => (
                    <div key={member.student_id} className="member-details">
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
                {members.length > 5 && (
                    <button onClick={handleViewMoreMembers}>查看所有成员</button>
                )}
            </div>

            <div className="activity-section">
                <h3>活动:</h3>
                <div className="activity-buttons">
                    <button onClick={handleViewAvailableActivities}>可参加的活动</button>
                    <button onClick={handleViewJoinedActivities}>已参加的活动</button>
                </div>
                {activities.length > 0 ? (
                    activities.map(activity => (
                        <div key={activity.activityID} className="activity-details">
                            <h4>{activity.activityName}</h4>
                            <p>{activity.intro}</p>
                            <p><strong>开始时间:</strong> {new Date(parseInt(activity.starttime)).toLocaleString()}</p>
                            <p><strong>结束时间:</strong> {new Date(parseInt(activity.finishtime)).toLocaleString()}</p>
                            <p><strong>当前人数:</strong> {activity.num}/{activity.upLimit}</p>
                            {viewMode === 'available' && (
                                <button onClick={() => handleJoinActivity(activity.activityID)}>加入活动</button>
                            )}
                        </div>
                    ))
                ) : (
                    <p>没有活动。</p>
                )}
            </div>

            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={() => setShowModal(false)}>&times;</span>
                        <h2>所有成员</h2>
                        {allMembers.map(member => (
                            <div key={member.student_id} className="member-details">
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
                    </div>
                </div>
            )}

            <div className="button-group">
                <button className="back-button" onClick={handleBack}>
                    返回
                </button>
            </div>
        </div>
    );
};

export default MyClubInfo;
