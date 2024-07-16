import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import useClubNameStore from 'Pages/student/ClubNameStore';
import { FetchInfoMessage } from 'Plugins/ClubAPI/FetchInfoMessage';
import { FetchNameMessage } from 'Plugins/DoctorAPI/FetchNameMessage';
import { FetchProfileMessage } from 'Plugins/DoctorAPI/FetchProfileMessage';
import { QueryMemberMessage } from 'Plugins/ClubAPI/QueryMemberMessage';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import './manageclub.css';
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

export const MyClubInfo: React.FC = () => {
    const history = useHistory();
    const { ClubName, setClubName } = useClubNameStore();
    const { Id } = useIdStore();
    const [clubInfo, setClubInfo] = useState<ClubInfo | null>(null);
    const [leaderInfo, setLeaderInfo] = useState<{ name: string; profile: string } | null>(null);
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
                <button className="back-button" onClick={handleBack}>
                    返回
                </button>
            </div>
        </div>
    );
};

export default MyClubInfo;
