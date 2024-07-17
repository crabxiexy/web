import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import './dashboard.css';
import useIdStore from 'Pages/IdStore';
import useTokenStore from 'Pages/TokenStore';
import { FetchProfileMessage } from 'Plugins/DoctorAPI/FetchProfileMessage';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import { QueryReceivedMessage } from 'Plugins/NotificationAPI/QueryReceivedMessage';
import { CountRunMessage } from 'Plugins/RunAPI/CountRunMessage'; // Import CountRunMessage
import { CountGroupexMessage } from 'Plugins/GroupExAPI/CountGroupexMessage'; // Import CountGroupexMessage

export function Dashboard() {
    const history = useHistory();
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const { Id, setId } = useIdStore();
    const { setToken } = useTokenStore();
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [notifications, setNotifications] = useState<{ content: string; releaserName: string }[]>([]);

    // State to hold the counts
    const [runCount, setRunCount] = useState<number | null>(null);
    const [groupexCount, setGroupexCount] = useState<number | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            const fetchProfileMessage = new FetchProfileMessage(parseInt(Id));
            try {
                const response = await sendPostRequest(fetchProfileMessage);
                setProfileImage(response.data);
            } catch (error) {
                console.error('Error fetching profile:', error);
            }
        };

        const fetchNotifications = async () => {
            const fetchNotificationsMessage = new QueryReceivedMessage(parseInt(Id));
            try {
                const response = await sendPostRequest(fetchNotificationsMessage);
                setNotifications(response.data);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        const fetchCounts = async () => {
            // Fetch run count
            const runMessage = new CountRunMessage(parseInt(Id));
            try {
                const runResponse = await sendPostRequest(runMessage);
                setRunCount(runResponse.data); // Assuming response.data contains the count
            } catch (error) {
                console.error('Error fetching run count:', error);
            }

            // Fetch groupex count
            const groupexMessage = new CountGroupexMessage(parseInt(Id));
            try {
                const groupexResponse = await sendPostRequest(groupexMessage);
                setGroupexCount(groupexResponse.data); // Assuming response.data contains the count
            } catch (error) {
                console.error('Error fetching groupex count:', error);
            }
        };
        fetchCounts();
        fetchProfile();
        fetchNotifications();// Fetch counts on mount
    }, [Id]);

    const toggleDropdown = () => {
        setDropdownVisible(!dropdownVisible);
    };

    const handleRename = () => {
        history.push("/rename");
    };

    const handleRunUpload = () => {
        history.push("/student_runupload");
    };

    const checkRecord = () => {
        history.push("/student_check");
    };

    const checkGroupEx = () => {
        history.push("/student_checkgroupex");
    };

    const UpdateProfile = () => {
        history.push("/update_profile");
    };

    const handleLogout = () => {
        setId('');
        setToken('');
        history.push("/");
    };

    const ViewClub = () => {
        history.push("/ViewClub");
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>Physical Exercise System</h1>
                <div className="user-section">
                    <button className="btn login-btn" onClick={handleLogout}>Logout</button>
                    <div className="user-avatar" onClick={toggleDropdown}>
                        {profileImage && (
                            <img src={profileImage} alt="User Avatar" className="avatar-image" />
                        )}
                    </div>
                    {dropdownVisible && (
                        <div className="dropdown-menu">
                            <p onClick={handleRename}>Rename</p>
                            <p onClick={UpdateProfile}>Profile</p>
                        </div>
                    )}
                </div>
            </header>
            <main>
                <section className="notifications">
                    <h2>Notifications</h2>
                    <div className="notification-board">
                        {notifications.length === 0 ? (
                            <p>No notifications available.</p>
                        ) : (
                            notifications.map((notification, index) => (
                                <div key={index} className="notification-item">
                                    <p><strong>{notification.releaserName}</strong>: {notification.content}</p>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* Display run and groupex counts */}
                <section className="counts">
                    <h2>Counts</h2>
                    <p>Run Count: {runCount !== null ? runCount : "Loading..."}</p>
                    <p>Group Exercise Count: {groupexCount !== null ? groupexCount : "Loading..."}</p>
                </section>

                <div className="square-block" onClick={handleRunUpload}>
                    阳光长跑登记
                </div>
                <div className="square-block" onClick={checkRecord}>
                    锻炼记录查询
                </div>
                <div className="square-block" onClick={checkGroupEx}>
                    集体锻炼查询
                </div>
                <div className="square-block" onClick={ViewClub}>
                    俱乐部活动查询
                </div>
            </main>
        </div>
    );
}

export default Dashboard;
