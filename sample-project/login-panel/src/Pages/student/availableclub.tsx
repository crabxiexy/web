import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import useClubNameStore from 'Pages/student/ClubNameStore';
import { FetchInfoMessage } from 'Plugins/ClubAPI/FetchInfoMessage';
import { FetchNameMessage } from 'Plugins/DoctorAPI/FetchNameMessage';
import { QueryMemberMessage } from 'Plugins/ClubAPI/QueryMemberMessage';
import { ApplyMemberMessage } from 'Plugins/ClubAPI/ApplyMemberMessage';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import { ShowActivityMessage } from 'Plugins/ActivityAPI/ShowActivityMessage';
import availableclubinfo_style from './availableclub.module.css';
import { ReleaseNotificationMessage } from 'Plugins/NotificationAPI/ReleaseNotificationMessage';
import useIdStore from 'Pages/IdStore';
import Sidebar from 'Pages/Sidebar';
import { FetchProfileMessage } from 'Plugins/DoctorAPI/FetchProfileMessage';

export const AvailableClubInfo: React.FC = () => {
    const history = useHistory();
    const { ClubName } = useClubNameStore();
    const { Id } = useIdStore();
    const [clubInfo, setClubInfo] = useState<any>(null);
    const [members, setMembers] = useState<any[]>([]);
    const [activities, setActivities] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [allMembers, setAllMembers] = useState<any[]>([]);
    const [error, setError] = useState<string>('');
    const [leaderName, setLeaderName] = useState<string | null>(null);

    useEffect(() => {
        fetchClubInfo();
        fetchActivities();
    }, [ClubName]);

    const fetchClubInfo = async () => {
        try {
            const infoResponse = await sendPostRequest(new FetchInfoMessage(ClubName));
            const clubData = infoResponse.data[0];
            setClubInfo(clubData);
            const leadernameResponse = await sendPostRequest(new FetchNameMessage(clubData.leader));
            setLeaderName(leadernameResponse.data);
            const membersResponse = await sendPostRequest(new QueryMemberMessage(ClubName));
            const memberDetails = await Promise.all(membersResponse.data.map(async (member: any) => {
                const nameResponse = await sendPostRequest(new FetchNameMessage(member.member));
                const profileResponse = await sendPostRequest(new FetchProfileMessage(member.member));
                return {
                    ...member,
                    name: nameResponse.data,
                    profile: profileResponse.data,
                };
            }));
            setMembers(memberDetails);
        } catch (error) {
            setError('加载俱乐部信息失败，请重试。');
        }
    };

    const fetchActivities = async () => {
        try {
            const activitiesResponse = await sendPostRequest(new ShowActivityMessage(ClubName));
            setActivities(activitiesResponse.data);
        } catch (error) {
            setError('加载活动信息失败，请重试。');
        }
    };

    const handleViewMoreMembers = async () => {
        setShowModal(true);
        const allMembersResponse = await sendPostRequest(new QueryMemberMessage(ClubName));
        const allMemberDetails = await Promise.all(allMembersResponse.data.map(async (member: any) => {
            const nameResponse = await sendPostRequest(new FetchNameMessage(member.member));
            return {
                ...member,
                name: nameResponse.data,
            };
        }));
        setAllMembers(allMemberDetails);
    };

    const handleBack = () => {
        history.goBack();
    };

    const handleApplyToJoin = async () => {
        try {
            const applyMessage = new ApplyMemberMessage(parseInt(Id), ClubName);
            await sendPostRequest(applyMessage);
            alert('申请加入成功！');

            // Fetch the club leader's ID
            const infoResponse = await sendPostRequest(new FetchInfoMessage(ClubName));
            const leaderId = infoResponse.data[0]?.leader;

            // Fetch the student's name
            const studentNameResponse = await sendPostRequest(new FetchNameMessage(parseInt(Id)));
            const studentName = studentNameResponse.data;

            // Send notification to the club leader
            if (leaderId) {
                const notificationMessage = new ReleaseNotificationMessage(
                    studentName,
                    parseInt(Id),
                    leaderId,
                    `学生 ${studentName} 申请加入俱乐部 ${ClubName}`
                );
                await sendPostRequest(notificationMessage);
            }
        } catch (error) {
            setError('申请加入俱乐部失败，请重试。');
        }
    };

    return (
        <div className={availableclubinfo_style.pageContainer}>
            <Sidebar />
            <div className={availableclubinfo_style.mainContent}>
                <h1 className={availableclubinfo_style.clubTitle}>俱乐部信息</h1>
                {error && <p className={availableclubinfo_style.errorMessage}>{error}</p>}
                {clubInfo && (
                    <div className={availableclubinfo_style.clubDetails}>
                        <div className={availableclubinfo_style.textInfo}>
                            <h2>{clubInfo.name}</h2>
                            <p><strong>简介: </strong> {clubInfo.intro}</p>
                            <p><strong>负责人: </strong> {leaderName}</p>
                            <p><strong>院系: </strong> {clubInfo.department}</p>
                        </div>
                        <div className={availableclubinfo_style.profileImage}>
                            <img
                                src={clubInfo.profile}
                                alt="Club Profile"
                                className={availableclubinfo_style.clubProfileImg}
                            />
                        </div>
                    </div>
                )}

                <div className={availableclubinfo_style.memberList}>
                    <h3>成员</h3>
                    <div className={availableclubinfo_style.memberRow}>
                        {members.slice(0, 5).map(member => (
                            <div key={member.student_id} className={availableclubinfo_style.memberDetails}>
                                <div className={availableclubinfo_style.profileCircle}>
                                    <img
                                        src={member.profile}
                                        alt={member.name}
                                        className={availableclubinfo_style.memberProfileImg}
                                    />
                                </div>
                                <span>{member.name}</span>
                            </div>
                        ))}
                    </div>
                    {members.length > 5 && (
                        <button className={availableclubinfo_style.viewMoreButton} onClick={handleViewMoreMembers}>查看所有成员</button>
                    )}
                </div>

                <div className={availableclubinfo_style.activitySection}>
                    <h3>活动</h3>
                    <div className={availableclubinfo_style.activitiesList}>
                        {activities.map(activity => (
                            <div key={activity.activityID} className={availableclubinfo_style.activityDetails}>
                                <p><strong>活动名称: </strong> {activity.activityName}</p>
                                <p><strong>介绍: </strong> {activity.intro}</p>
                                <p><strong>开始时间: </strong> {new Date(parseInt(activity.starttime)).toLocaleString()}</p>
                                <p><strong>结束时间: </strong> {new Date(parseInt(activity.finishtime)).toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <button className={availableclubinfo_style.applyButton} onClick={handleApplyToJoin}>申请加入</button>

                {showModal && (
                    <div className={availableclubinfo_style.modal}>
                        <div className={availableclubinfo_style.modalContent}>
                            <span className={availableclubinfo_style.close} onClick={() => setShowModal(false)}>&times;</span>
                            <h2>所有成员</h2>
                            <div className={availableclubinfo_style.allMembers}>
                                {allMembers.map(member => (
                                    <div key={member.member} className={availableclubinfo_style.memberDetailsModal}>
                                        <div className={availableclubinfo_style.profileCircleSmallModal}>
                                            <img
                                                src={member.profile}
                                                alt={member.name}
                                                className={availableclubinfo_style.memberProfileImg}
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
    );
};

export default AvailableClubInfo;
