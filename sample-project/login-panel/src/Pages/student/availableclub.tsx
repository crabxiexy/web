import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import useClubNameStore from 'Pages/student/ClubNameStore';
import { FetchClubInfoMessage } from 'Plugins/ClubAPI/FetchClubInfoMessage';
import { ApplyMemberMessage } from 'Plugins/ClubAPI/ApplyMemberMessage';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import { ShowActivityMessage } from 'Plugins/ActivityAPI/ShowActivityMessage';
import availableclubinfo_style from './availableclub.module.css';
import { ReleaseNotificationMessage } from 'Plugins/NotificationAPI/ReleaseNotificationMessage';
import useIdStore from 'Pages/IdStore';
import Sidebar from 'Pages/Sidebar';
import { Club, Activity, Student } from 'Pages/types'; // Import types

export const AvailableClubInfo: React.FC = () => {
    const history = useHistory();
    const { ClubName } = useClubNameStore();
    const { Id } = useIdStore();
    const [clubInfo, setClubInfo] = useState<Club | null>(null);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState<string>('');
    const [modalMembers, setModalMembers] = useState<Student[]>([]); // State for members in modal

    useEffect(() => {
        fetchClubInfo();
        fetchActivities();
    }, [ClubName]);

    const fetchClubInfo = async () => {
        try {
            const infoResponse = await sendPostRequest(new FetchClubInfoMessage(ClubName));
            const clubData = infoResponse.data as Club;
            setClubInfo(clubData);
        } catch (error) {
            setError('加载俱乐部信息失败，请重试。');
        }
    };

    const fetchActivities = async () => {
        try {
            const activitiesResponse = await sendPostRequest(new ShowActivityMessage(ClubName));
            setActivities(activitiesResponse.data as Activity[]);
        } catch (error) {
            setError('加载活动信息失败，请重试。');
        }
    };

    const handleViewMoreMembers = (members: Student[]) => {
        setModalMembers(members);
        setShowModal(true);
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
            const leaderId = clubInfo?.leader.studentID;

            // Fetch the student's name
            const studentName = clubInfo?.leader.name;

            // Send notification to the club leader
            if (leaderId && studentName) {
                const notificationMessage = new ReleaseNotificationMessage(
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
                            <p><strong>负责人: </strong> {clubInfo.leader.name}</p>
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
                        {clubInfo?.members.slice(0, 5).map(member => (
                            <div key={member.studentID} className={availableclubinfo_style.memberDetails}>
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
                    {clubInfo?.members.length > 5 && (
                        <button className={availableclubinfo_style.viewMoreButton} onClick={() => handleViewMoreMembers(clubInfo.members)}>查看所有成员</button>
                    )}
                </div>

                <div className={availableclubinfo_style.activitySection}>
                    <h3>活动</h3>
                    <div className={availableclubinfo_style.activitiesList}>
                        {activities.map(activity => (
                            <div key={activity.activityID} className={availableclubinfo_style.activityDetails}>
                                <p><strong>活动名称: </strong> {activity.activityName}</p>
                                <p><strong>介绍: </strong> {activity.intro}</p>
                                <p><strong>开始时间: </strong> {new Date(activity.startTime).toLocaleString()}</p>
                                <p><strong>结束时间: </strong> {new Date(activity.finishTime).toLocaleString()}</p>
                                <p><strong>组织者: </strong> {activity.organizor.name}</p>
                                <div>
                                    <h4>成员</h4>
                                    <div className={availableclubinfo_style.memberRow}>
                                        {activity.members.slice(0, 5).map(member => (
                                            <div key={member.studentID} className={availableclubinfo_style.memberDetails}>
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
                                    {activity.members.length > 5 && (
                                        <button className={availableclubinfo_style.viewMoreButton} onClick={() => handleViewMoreMembers(activity.members)}>查看所有成员</button>
                                    )}
                                </div>
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
                                {modalMembers.map(member => (
                                    <div key={member.studentID} className={availableclubinfo_style.memberDetailsModal}>
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