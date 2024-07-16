import React, { useState, useEffect, useId } from 'react'
import { useHistory } from 'react-router-dom';
import useClubNameStore from 'Pages/student/ClubNameStore';
import { FetchInfoMessage } from 'Plugins/ClubAPI/FetchInfoMessage';
import { FetchNameMessage } from 'Plugins/DoctorAPI/FetchNameMessage';
import { FetchProfileMessage } from 'Plugins/DoctorAPI/FetchProfileMessage';
import { QueryMemberMessage } from 'Plugins/ClubAPI/QueryMemberMessage';
import { ApplyMemberMessage } from 'Plugins/ClubAPI/ApplyMemberMessage';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import './manageclub.css';
import useIdStore from 'Pages/IdStore';
export const AvailableClubInfo: React.FC = () => {
    const history = useHistory();
    const { ClubName } = useClubNameStore();
    const {Id}=useIdStore();
    const [clubInfo, setClubInfo] = useState<any>(null);
    const [leaderInfo, setLeaderInfo] = useState<any>(null);
    const [members, setMembers] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [allMembers, setAllMembers] = useState<any[]>([]);
    const [error, setError] = useState<string>('');

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
                const leaderProfileResponse = await sendPostRequest(new FetchProfileMessage(leaderId));

                setLeaderInfo({
                    name: leaderNameResponse.data,
                    profile: leaderProfileResponse.data
                });
            }

            const membersResponse = await sendPostRequest(new QueryMemberMessage(ClubName));
            setMembers(membersResponse.data);
        } catch (error) {
            setError('加载俱乐部信息失败，请重试。');
        }
    };

    const handleViewMoreMembers = async () => {
        setShowModal(true);
        const allMembersResponse = await sendPostRequest(new QueryMemberMessage(ClubName));
        setAllMembers(allMembersResponse.data);
    };

    const handleBack = () => {
        history.goBack();
    };

    const handleApplyToJoin = async () => {
        try {
            const applyMessage = new ApplyMemberMessage(parseInt(Id), ClubName);
            await sendPostRequest(applyMessage);
            alert('申请加入成功！');
        } catch (error) {
            setError('申请加入俱乐部失败，请重试。');
        }
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
                <p>活动信息将在这里显示。</p>
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
                <button className="apply-button" onClick={handleApplyToJoin}>
                    申请加入
                </button>
                <button className="back-button" onClick={handleBack}>
                    返回
                </button>
            </div>
        </div>
    );
};

export default AvailableClubInfo;