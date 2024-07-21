import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import useClubNameStore from 'Pages/student/ClubNameStore';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import { FetchClubInfoMessage } from 'Plugins/ClubAPI/FetchClubInfoMessage';
import { Student, Club } from 'Plugins/type';
import Sidebar from 'Pages/Sidebar';
import student_myclub_style from './myclub.module.css';
import useIdStore from 'Pages/IdStore';
import { QueryMemberMessage } from 'Plugins/ClubAPI/QueryMemberMessage';
import { MemberQueryActivityMessage } from 'Plugins/ActivityAPI/MemberQueryActivityMessage';
import { JoinActivityMessage } from 'Plugins/ActivityAPI/JoinActivityMessage';
import { ActivityStatus, JoinStatus, AdditionalStatus } from 'Plugins/ActivityStatus';

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
    const [clubInfo, setClubInfo] = useState<Club | null>(null);
    const [leaderInfo, setLeaderInfo] = useState<Student | null>(null);
    const [members, setMembers] = useState<Student[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [allMembers, setAllMembers] = useState<Student[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [error, setError] = useState<string>('');
    const [viewMode, setViewMode] = useState<'available' | 'joined'>('available');

    useEffect(() => {
        fetchClubInfo();
        fetchActivities('available');
    }, [ClubName]);

    const fetchClubInfo = async () => {
        try {
            const clubInfoResponse = await sendPostRequest(new FetchClubInfoMessage(ClubName));
            const clubData: Club = clubInfoResponse.data;

            setClubInfo(clubData);
            setLeaderInfo(clubData.leader);
            setMembers(clubData.members);
        } catch (error) {
            setError('加载俱乐部信息失败，请重试。');
        }
    };

    const fetchActivities = async (mode: 'available' | 'joined') => {
        try {
            const currentTime = new Date().toISOString();
            const currentTimestamp = new Date(currentTime).getTime();
            let activitiesResponse;
            let requestMessage;
            if (mode === 'available') {
                requestMessage = new MemberQueryActivityMessage(
                    studentIdNumber,
                    ClubName,
                    currentTimestamp.toString(),
                    ActivityStatus.NotFinished,
                    JoinStatus.NotJoined,
                    AdditionalStatus.AvailableToJoin
                );
                console.log('Sending request:', requestMessage);

                activitiesResponse = await sendPostRequest(requestMessage);
            } else {
                activitiesResponse = await sendPostRequest(new MemberQueryActivityMessage(
                    studentIdNumber,
                    ClubName,
                    currentTimestamp.toString(),
                    ActivityStatus.NotFinished,
                    JoinStatus.Joined,
                    AdditionalStatus.All
                ));
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
        const allMembersData: Student[] = allMembersResponse.data;

        setAllMembers(allMembersData);
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
        <div className={student_myclub_style.App}>
            <Sidebar />
            <div className={student_myclub_style.myClubInfo}>
                <div className={student_myclub_style.content}>
                    {error && <p className={student_myclub_style.errorMessage}>{error}</p>}
                    {clubInfo && (
                        <div className={student_myclub_style.clubDetailsBox}>
                            <div className={student_myclub_style.textInfo}>
                                <h2>{clubInfo.name}</h2>
                                <p><strong>简介: </strong> {clubInfo.intro}</p>
                                <p><strong>负责人: </strong> {leaderInfo?.name}</p>
                                <p><strong>院系: </strong> {clubInfo.department}</p>
                            </div>
                        </div>
                    )}

                    <div className={student_myclub_style.membersBox}>
                        <h3>成员</h3>
                        <div className={student_myclub_style.memberRow}>
                            {members.slice(0, 5).map(member => (
                                <div key={member.studentID} className={student_myclub_style.memberDetails}>
                                    <div className={student_myclub_style.profileCircleSmall}>
                                        <img
                                            src={member.profile}
                                            alt={member.name}
                                            className={student_myclub_style.memberProfileImg}
                                        />
                                    </div>
                                    <span>{member.name}</span>
                                </div>
                            ))}
                        </div>
                        {members.length > 5 && (
                            <div className={student_myclub_style.viewMoreMembersButton}>
                                <button onClick={handleViewMoreMembers} className={student_myclub_style.smallButton}>查看所有成员</button>
                            </div>
                        )}
                    </div>

                    <div className={student_myclub_style.activitiesBox}>
                        <h3>活动</h3>
                        <div className={student_myclub_style.activityButtons}>
                            <button className={student_myclub_style.button} onClick={handleViewAvailableActivities}>可参加的活动</button>
                            <button className={student_myclub_style.button} onClick={handleViewJoinedActivities}>已参加的活动</button>
                        </div>
                        <div className={student_myclub_style.activitiesList}>
                            {activities.length > 0 ? (
                                activities.map(activity => (
                                    <div key={activity.activityID} className={student_myclub_style.activityDetails}>
                                        <h4>{activity.activityName}</h4>
                                        <p>{activity.intro}</p>
                                        <p><strong>开始时间: </strong> {new Date(parseInt(activity.starttime)).toLocaleString()}</p>
                                        <p><strong>结束时间: </strong> {new Date(parseInt(activity.finishtime)).toLocaleString()}</p>
                                        <p><strong>当前人数: </strong> {activity.num}</p>
                                        {viewMode === 'available' && (
                                            <button onClick={() => handleJoinActivity(activity.activityID)}>加入活动</button>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p>没有活动。</p>
                            )}
                        </div>
                    </div>

                    {showModal && (
                        <div className={student_myclub_style.modal}>
                            <div className={student_myclub_style.modalContent}>
                                <span className={student_myclub_style.close} onClick={() => setShowModal(false)}>&times;</span>
                                <h2>所有成员</h2>
                                <div className={student_myclub_style.allMembers}>
                                    {allMembers.map(member => (
                                        <div key={member.studentID} className={student_myclub_style.memberDetailsModal}>
                                            <div className={student_myclub_style.profileCircleSmallModal}>
                                                <img
                                                    src={member.profile}
                                                    alt={member.name}
                                                    className={student_myclub_style.memberProfileImg}
                                                />
                                            </div>
                                            <span>{member.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyClubInfo;
