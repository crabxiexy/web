import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import useIdStore from 'Pages/IdStore';
import { CreateAppMessage } from 'Plugins/ClubAPI/CreateAppMessage';
import { LeaderQueryMessage } from 'Plugins/ClubAPI/LeaderQueryMessage';
import useClubNameStore from 'Pages/student/ClubNameStore';
import { CheckAvailableMessage } from 'Plugins/ClubAPI/CheckAvailableMessage';
import { CheckJointClubMessage } from 'Plugins/ClubAPI/CheckJointClubMessage';
import Sidebar from 'Pages/Sidebar';
import viewclub_styles from './viewclub.module.css';
import { ApplyMemberMessage } from 'Plugins/ClubAPI/ApplyMemberMessage';
import { FetchInfoMessage } from 'Plugins/ClubAPI/FetchInfoMessage';
import { FetchNameMessage } from 'Plugins/DoctorAPI/FetchNameMessage';
import { ReleaseNotificationMessage } from 'Plugins/NotificationAPI/ReleaseNotificationMessage';

export const ViewClub: React.FC = () => {
    const history = useHistory();
    const { Id } = useIdStore();
    const { ClubName, setClubName } = useClubNameStore();
    const [activeTab, setActiveTab] = useState('myClubs');
    const [myClubs, setMyClubs] = useState<any[]>([]);
    const [availableClubs, setAvailableClubs] = useState<any[]>([]);
    const [managedClubs, setManagedClubs] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [clubName, setClubNameState] = useState('');
    const [clubIntro, setClubIntro] = useState('');
    const [clubDepartment, setClubDepartment] = useState('');
    const [error, setError] = useState<string>('');

    useEffect(() => {
        fetchMyClubs();
        fetchAvailableClubs();
        fetchManagedClubs();
    }, [Id]);

    const fetchMyClubs = async () => {
        try {
            const myClubsResponse = await sendPostRequest(new CheckJointClubMessage(parseInt(Id)));
            setMyClubs(myClubsResponse.data);
        } catch (error) {
            setError('加载我的俱乐部失败，请重试。');
        }
    };

    const fetchAvailableClubs = async () => {
        try {
            const availableClubsResponse = await sendPostRequest(new CheckAvailableMessage(parseInt(Id)));
            setAvailableClubs(availableClubsResponse.data);
        } catch (error) {
            setError('加载可加入的俱乐部失败，请重试。');
        }
    };

    const fetchManagedClubs = async () => {
        try {
            const managedClubsResponse = await sendPostRequest(new LeaderQueryMessage(parseInt(Id)));
            setManagedClubs(managedClubsResponse.data);
        } catch (error) {
            setError('加载管理的俱乐部失败，请重试。');
        }
    };

    const handleCreateClub = async () => {
        if (!clubName || !clubIntro || !clubDepartment) {
            setError('请填写所有字段。');
            return;
        }

        const createAppMessage = new CreateAppMessage(clubName, parseInt(Id), clubIntro, clubDepartment);
        try {
            await sendPostRequest(createAppMessage);
            alert('俱乐部申请成功！');
            setShowModal(false);
        } catch (error) {
            setError('俱乐部申请失败，请重试。');
        }
    };

    const handleManagedClubClick = (club: any) => {
        setClubName(club.name);
        history.push(`/managed_club`); // Navigate to ManagedClubInfo page
    };

    const handleMyClubClick = (club: any) => {
        setClubName(club.name);
        history.push(`/my_club`);
    };

    const handleAvailableClubClick = (club: any) => {
        setClubName(club.name);
        history.push(`/available_club`);
    };

    const handleApplyToJoin = async (clubName: string) => {
        try {
            setClubName(clubName); // Update the clubName state
            const applyMessage = new ApplyMemberMessage(parseInt(Id), clubName);
            await sendPostRequest(applyMessage);
            alert('申请加入成功！');

            // Fetch the club leader's ID
            const infoResponse = await sendPostRequest(new FetchInfoMessage(clubName));
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
                    `学生 ${studentName} 申请加入俱乐部 ${clubName}`
                );
                await sendPostRequest(notificationMessage);
            }
        } catch (error) {
            setError('申请加入俱乐部失败，请重试。');
        }
    };

    const ClubCard: React.FC<{ club: any; onClick: () => void; actionText?: string; onActionClick?: () => void }> = ({ club, onClick, actionText, onActionClick }) => (
        <div className={viewclub_styles.clubCard} onClick={onClick}>
            <div className={viewclub_styles.clubImage}>
                <img src={club.profile} alt={club.name} className={viewclub_styles.fixedSizeImage} />
            </div>
            <div className={viewclub_styles.clubInfo}>
                <h3>{club.name}</h3>
                <p><strong>简介:</strong> {club.intro}</p>
                {actionText && (
                    <button onClick={(e) => {
                        e.stopPropagation();
                        onActionClick?.();
                    }} className={viewclub_styles.actionButton}>{actionText}</button>
                )}
                {activeTab === "availableClubs" &&
                    <button onClick={(e) => {
                        e.stopPropagation();
                        handleApplyToJoin(club.name);
                    }} className={viewclub_styles.actionButton}>申请加入
                    </button>}
            </div>
        </div>
    );

    return (
        <div className={viewclub_styles.App}>
            <Sidebar/>

            <div className={viewclub_styles.viewClubContainer}>
                <div className={viewclub_styles.content}>
                    <header className={viewclub_styles.header}>
                        <h1>查看俱乐部</h1>
                        {error && <p className={viewclub_styles.errorMessage}>{error}</p>}
                    </header>

                    <main className={viewclub_styles.main}>
                        {activeTab === 'myClubs' && (
                            <div className={viewclub_styles.clubList}>
                                {myClubs.length > 0 ? (
                                    myClubs.map(club => (
                                        <ClubCard
                                            key={club.id}
                                            club={club}
                                            onClick={() => handleMyClubClick(club)}
                                            actionText="查看俱乐部"
                                        />
                                    ))
                                ) : (
                                    <p>没有加入的俱乐部。</p>
                                )}
                            </div>
                        )}
                        {activeTab === 'availableClubs' && (
                            <div className={viewclub_styles.clubList}>
                                {availableClubs.length > 0 ? (
                                    availableClubs.map(club => (
                                        <ClubCard
                                            key={club.id}
                                            club={club}
                                            onClick={() => handleAvailableClubClick(club)}
                                        />
                                    ))
                                ) : (
                                    <p>没有可以加入的俱乐部。</p>
                                )}
                            </div>
                        )}
                        {activeTab === 'managedClubs' && (
                            <div className={viewclub_styles.clubList}>
                                {managedClubs.length > 0 ? (
                                    managedClubs.map(club => (
                                        <ClubCard
                                            key={club.id}
                                            club={club}
                                            onClick={() => handleManagedClubClick(club)}
                                            actionText="查看管理"
                                        />
                                    ))
                                ) : (
                                    <p>没有管理的俱乐部。</p>
                                )}
                                <button className={viewclub_styles.createButton} onClick={() => setShowModal(true)}>申请建立新俱乐部</button>
                            </div>
                        )}
                    </main>

                    {showModal && (
                        <div className={viewclub_styles.modal}>
                            <div className={viewclub_styles.modalContent}>
                                <span className={viewclub_styles.close}
                                      onClick={() => setShowModal(false)}>&times;</span>
                                <h2>申请建立新俱乐部</h2>
                                <input
                                    type="text"
                                    placeholder="俱乐部名字"
                                    value={clubName}
                                    onChange={(e) => setClubNameState(e.target.value)}
                                    required
                                />
                                <textarea
                                    placeholder="俱乐部简介"
                                    value={clubIntro}
                                    onChange={(e) => setClubIntro(e.target.value)}
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="俱乐部所在院系"
                                    value={clubDepartment}
                                    onChange={(e) => setClubDepartment(e.target.value)}
                                    required
                                />
                                <button onClick={handleCreateClub}>提交申请</button>
                            </div>
                        </div>
                    )}

                    <nav className={viewclub_styles.tabNav}>
                        <button onClick={() => setActiveTab('myClubs')}>我加入的俱乐部</button>
                        <button onClick={() => setActiveTab('availableClubs')}>可以加入的俱乐部</button>
                        <button onClick={() => setActiveTab('managedClubs')}>我管理的俱乐部</button>
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default ViewClub;