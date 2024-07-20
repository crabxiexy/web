import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Modal from 'react-modal';
import useClubNameStore from 'Pages/student/ClubNameStore';
import useIdStore from 'Pages/IdStore';
import { FetchInfoMessage } from 'Plugins/ClubAPI/FetchInfoMessage';
import { FetchNameMessage } from 'Plugins/DoctorAPI/FetchNameMessage';
import { FetchProfileMessage } from 'Plugins/DoctorAPI/FetchProfileMessage';
import { QueryMemberMessage } from 'Plugins/ClubAPI/QueryMemberMessage';
import { QueryApplyMessage } from 'Plugins/ClubAPI/QueryApplyMessage';
import { ResponseStudentApplyMessage } from 'Plugins/ClubAPI/ResponseStudentApplyMessage';
import { AddMemberMessage } from 'Plugins/ClubAPI/AddMemberMessage';
import { CreateActivityMessage } from 'Plugins/ActivityAPI/CreateActivityMessage';
import { ReleaseNotificationMessage } from 'Plugins/NotificationAPI/ReleaseNotificationMessage';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import student_manageclub_style from './manageclub.module.css';
import Sidebar from 'Pages/Sidebar';

interface Application {
    studentID: number;
    clubName: string;
    is_checked: number;
    result: number;
    name?: string;
    profile?: string;
}

interface Activity {
    clubName: string;
    activityName: string;
    intro: string;
    startTime: string;
    finishTime: string;
    organizorId: number;
    lowLimit: number;
    upLimit: number;
    num: number;
}

export const ManagedClubInfo: React.FC = () => {
    const { Id } = useIdStore();
    const studentIdNumber = parseInt(Id);
    const history = useHistory();
    const [memberId, setMemberId] = useState('');
    const { ClubName } = useClubNameStore();
    const [clubInfo, setClubInfo] = useState<any>(null);
    const [leaderInfo, setLeaderInfo] = useState<any>(null);
    const [members, setMembers] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [allMembers, setAllMembers] = useState<any[]>([]);
    const [error, setError] = useState<string>('');
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [applications, setApplications] = useState<Application[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [newActivity, setNewActivity] = useState<Activity>({
        clubName: ClubName,
        activityName: '',
        intro: '',
        startTime: new Date().toISOString().slice(0, 16),
        finishTime: '',
        organizorId: 0,
        lowLimit: undefined,
        upLimit: undefined,
        num: 0,
    });
    const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);
    const [leaderName,setLeaderName] = useState<string>('');
    useEffect(() => {
        fetchClubInfo();
    }, [ClubName]);

    const fetchClubInfo = async () => {
        try {
            const infoResponse = await sendPostRequest(new FetchInfoMessage(ClubName));
            const clubData = infoResponse.data[0];
            setClubInfo(clubData);

            const leaderId = clubData?.leader;

            if (leaderId) {
                const leaderNameResponse = await sendPostRequest(new FetchNameMessage(leaderId));
                setLeaderName(leaderNameResponse.data)
                const leaderProfileResponse = await sendPostRequest(new FetchProfileMessage(leaderId));
                setLeaderInfo({
                    id: leaderId,
                    profile: leaderProfileResponse.data
                });
            }

            const membersResponse = await sendPostRequest(new QueryMemberMessage(ClubName));
            const membersWithDetails = await Promise.all(
                membersResponse.data.map(async (member: any) => {
                    const profileResponse = await sendPostRequest(new FetchProfileMessage(member.member));
                    const nameResponse = await sendPostRequest(new FetchNameMessage(member.member));

                    return {
                        ...member,
                        name: nameResponse.data,
                        profile: profileResponse.data,
                    };
                })
            );
            setMembers(membersWithDetails);
        } catch (error) {
            setError('加载俱乐部信息失败，请重试。');
        }
    };

    const handleViewMoreMembers = async () => {
        setShowModal(true);
        const allMembersResponse = await sendPostRequest(new QueryMemberMessage(ClubName));
        const allMembersWithDetails = await Promise.all(
            allMembersResponse.data.map(async (member: any) => {
                const profileResponse = await sendPostRequest(new FetchProfileMessage(member.studentID));
                const nameResponse = await sendPostRequest(new FetchNameMessage(member.studentID));

                return {
                    ...member,
                    name: nameResponse.data,
                    profile: profileResponse.data,
                };
            })
        );

        setAllMembers(allMembersWithDetails);
    };

    const handleUpdate = () => {
        history.push('/update_clubinfo');
    };
    const handleMoreInfo = () => {
        history.push('/moreinfo');
    };
    const handleOpenApplyModal = async () => {
        setShowApplyModal(true);
        await fetchApplications();
    };

    const handleCloseApplyModal = () => {
        setShowApplyModal(false);
    };

    const fetchApplications = async () => {
        try {
            const response = await sendPostRequest(new QueryApplyMessage(ClubName));

            const applicationsWithDetails = await Promise.all(
                response.data.map(async (application: Application) => {
                    const profileResponse = await sendPostRequest(new FetchProfileMessage(application.studentID));
                    const nameResponse = await sendPostRequest(new FetchNameMessage(application.studentID));

                    return {
                        ...application,
                        name: nameResponse.data,
                        profile: profileResponse.data,
                    };
                })
            );

            setApplications(applicationsWithDetails);
        } catch (error) {
            setError('加载申请信息失败，请重试。');
        }
    };

    const handleResponseApplication = async (studentId: number, result: number) => {
        try {
            await sendPostRequest(new ResponseStudentApplyMessage(ClubName, studentId, result));

            if (result === 1) {
                await sendPostRequest(new AddMemberMessage(ClubName, studentId));
            }

            // Fetch the student's name
            const studentNameResponse = await sendPostRequest(new FetchNameMessage(studentId));
            const studentName = studentNameResponse.data;

            // Fetch the club leader's name
            const leaderNameResponse = await sendPostRequest(new FetchNameMessage(studentIdNumber));
            const leaderName = leaderNameResponse.data;

            // Send notification to the student
            const notificationMessage = new ReleaseNotificationMessage(
                leaderName,
                studentIdNumber,
                studentId,
                `您的申请已${result === 1 ? '通过' : '被拒绝'}。`
            );
            await sendPostRequest(notificationMessage);

            await fetchApplications();
        } catch (error) {
            setError('处理申请失败，请重试。');
        }
    };

    const handleCreateActivity = async () => {
        if (!newActivity.startTime || !newActivity.finishTime || !newActivity.activityName || !newActivity.lowLimit || !newActivity.upLimit) {
            setError('请填写活动基本信息！');
            return;
        }
        try {
            const startTimestamp = new Date(newActivity.startTime).getTime();
            const finishTimestamp = new Date(newActivity.finishTime).getTime();
            const response = await sendPostRequest(new CreateActivityMessage(
                newActivity.clubName,
                newActivity.activityName,
                newActivity.intro,
                startTimestamp.toString(),
                finishTimestamp.toString(),
                studentIdNumber,  // 使用当前用户的 student_id
                newActivity.lowLimit,
                newActivity.upLimit,
                newActivity.num
            ));

            if (response.data === 'Activity created successfully') {
                setActivities([...activities, { ...newActivity, organizorId: studentIdNumber }]);
                setNewActivity({
                    clubName: ClubName,
                    activityName: '',
                    intro: '',
                    startTime: '',
                    finishTime: '',
                    organizorId: 0,
                    lowLimit: 0,
                    upLimit: 0,
                    num: 0,
                });
                setModalIsOpen(false); // 关闭模态框
                alert('活动创建成功！');

                // Fetch all members
                const membersResponse = await sendPostRequest(new QueryMemberMessage(ClubName));
                const members = membersResponse.data;

                // Fetch the club leader's name
                const leaderNameResponse = await sendPostRequest(new FetchNameMessage(studentIdNumber));
                const leaderName = leaderNameResponse.data;

                // Send notification to all members
                for (const member of members) {
                    const notificationMessage = new ReleaseNotificationMessage(
                        leaderName,
                        studentIdNumber,
                        member.member,
                        `俱乐部 ${ClubName} 创建了一个新活动: ${newActivity.activityName}`
                    );
                    await sendPostRequest(notificationMessage);
                }
            } else {
                setError('创建活动失败，请重试。');
            }
        } catch (error) {
            setError('创建活动失败，请重试。');
        }
    };

    const openModal = () => setModalIsOpen(true);
    const closeModal = () => setModalIsOpen(false);

    return (
        <div className={student_manageclub_style.App}>
            <Sidebar />
            <div className={student_manageclub_style.managedClubContainer}>
                <div className={student_manageclub_style.content}>
                    {clubInfo && (
                        <div className={student_manageclub_style.clubDetails}>
                            <h2>{clubInfo.name}</h2>
                            <p><strong>简介: </strong> {clubInfo.intro}</p>
                            <p><strong>负责人: </strong> {leaderName}</p>


                            <button onClick={handleUpdate}
                                    className={student_manageclub_style.updateButton}>查看俱乐部信息
                            </button>
                        </div>
                    )}

                    <div className={student_manageclub_style.memberList}>
                        <h3>成员</h3>
                        <div className={student_manageclub_style.membetDetailContainer}>
                            {members.slice(0, 5).map(member => (
                                <div key={member.studentID} className={student_manageclub_style.memberDetails}>
                                    <div className={student_manageclub_style.profileCircle}>
                                        <img
                                            src={member.profile}
                                            alt={member.name}
                                            className={student_manageclub_style.memberProfileImg}
                                        />
                                    </div>
                                    <span>{member.name}</span>
                                </div>
                            ))}
                        </div>
                        {members.length > 5 && (
                            <button onClick={handleViewMoreMembers}
                                    className={student_manageclub_style.viewMoreButton}>查看所有成员</button>
                        )}
                        <div className={student_manageclub_style.buttonGroup}>
                            <button className={student_manageclub_style.applyButton} onClick={handleOpenApplyModal}>
                                审核新成员
                            </button>
                        </div>
                    </div>

                    <div className={student_manageclub_style.activitySection}>
                        <h3>活动</h3>
                        <div className={student_manageclub_style.activityButtons}>
                            <button onClick={openModal} className={student_manageclub_style.createActivityButton}>创建活动</button>
                            <button onClick={handleMoreInfo} className={student_manageclub_style.showMoreButton}>显示更多活动</button>
                        </div>
                        <div className={student_manageclub_style.activityList}>
                            {activities.map((activity, index) => (
                                <div key={index} className={student_manageclub_style.activityDetails}>
                                    <h4>{activity.activityName}</h4>
                                    <p>{activity.intro}</p>
                                    <p><strong>开始时间:</strong> {activity.startTime}</p>
                                    <p><strong>结束时间:</strong> {activity.finishTime}</p>
                                    <p><strong>组织者 ID:</strong> {activity.organizorId}</p>
                                    <p><strong>人数限制:</strong> {activity.lowLimit} - {activity.upLimit}</p>
                                    <p><strong>当前人数:</strong> {activity.num}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {showModal && (
                        <div className={student_manageclub_style.modal}>
                            <div className={student_manageclub_style.modalContent}>
                                <span className={student_manageclub_style.close} onClick={() => setShowModal(false)}>&times;</span>
                                <h2>所有成员</h2>
                                {allMembers.map(member => (
                                    <div key={member.studentID} className={student_manageclub_style.memberDetails}>
                                        <div className={student_manageclub_style.profileCircle}>
                                            <img
                                                src={member.profile}
                                                alt={member.name}
                                                className={student_manageclub_style.memberProfileImg}
                                            />
                                        </div>
                                        <span>{member.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {showApplyModal && (
                        <div className={student_manageclub_style.modal}>
                            <div className={student_manageclub_style.modalContent}>
                                <span className={student_manageclub_style.close} onClick={handleCloseApplyModal}>&times;</span>
                                <h2>审核新成员申请</h2>
                                <div className={student_manageclub_style.applicationList}>
                                    {applications.length > 0 ? (
                                        applications.map(application => (
                                            <div key={application.studentID} className={student_manageclub_style.applicationDetails}>
                                                <h3>学生 ID: {application.studentID}</h3>
                                                <div className={student_manageclub_style.applicationMemberInfo}>
                                                    <p>姓名: {application.name}</p>
                                                    <div className={student_manageclub_style.profileCircle}>
                                                        <img
                                                            src={application.profile}
                                                            alt={application.name}
                                                            className={student_manageclub_style.memberProfileImg}
                                                        />
                                                    </div>
                                                    <div className={student_manageclub_style.applicationActions}>
                                                        <button onClick={() => handleResponseApplication(application.studentID, 1)}>
                                                            通过
                                                        </button>
                                                        <button onClick={() => handleResponseApplication(application.studentID, 0)}>
                                                            不通过
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p>没有新成员申请。</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <Modal
                        isOpen={modalIsOpen}
                        onRequestClose={closeModal}
                        contentLabel="创建活动"
                        className={student_manageclub_style.modal}
                        overlayClassName={student_manageclub_style.modalOverlay}
                    >
                        <h2>创建活动</h2>
                        <form onSubmit={(e) => { e.preventDefault(); handleCreateActivity(); }}>
                            <div>
                                <label>活动名称: </label>
                                <input
                                    type="text"
                                    value={newActivity.activityName}
                                    onChange={(e) => setNewActivity({ ...newActivity, activityName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label>简介: </label>
                                <input
                                    type="text"
                                    value={newActivity.intro}
                                    onChange={(e) => setNewActivity({ ...newActivity, intro: e.target.value })}
                                />
                            </div>
                            <div>
                                <label>开始时间: </label>
                                <input
                                    type="datetime-local"
                                    value={newActivity.startTime}
                                    onChange={(e) => setNewActivity({ ...newActivity, startTime: e.target.value })}
                                />
                            </div>
                            <div>
                                <label>结束时间: </label>
                                <input
                                    type="datetime-local"
                                    value={newActivity.finishTime}
                                    onChange={(e) => setNewActivity({ ...newActivity, finishTime: e.target.value })}
                                />
                            </div>
                            <div>
                                <label>最低人数: </label>
                                <input
                                    type="number"
                                    placeholder="请输入最低人数"
                                    value={newActivity.lowLimit ?? ''}
                                    onChange={(e) => setNewActivity({ ...newActivity, lowLimit: e.target.value ? parseInt(e.target.value) : undefined })}
                                />
                            </div>
                            <div>
                                <label>最高人数: </label>
                                <input
                                    type="number"
                                    placeholder="请输入最高人数"
                                    value={newActivity.upLimit ?? ''}
                                    onChange={(e) => setNewActivity({ ...newActivity, upLimit: e.target.value ? parseInt(e.target.value) : undefined })}
                                />
                            </div>
                            <div className={student_manageclub_style.buttonGroup}>
                                <button type="submit" className={student_manageclub_style.submitButton}>提交</button>
                                <button type="button" onClick={closeModal}
                                        className={student_manageclub_style.cancelButton}>取消
                                </button>
                            </div>
                        </form>
                    </Modal>
                </div>
            </div>
        </div>
    );
};

export default ManagedClubInfo;