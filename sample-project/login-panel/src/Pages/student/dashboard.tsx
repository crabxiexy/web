import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import './dashboard.css'; // Import the CSS file
import useIdStore from 'Pages/IdStore'; // Adjust the path based on your file structure
import useTokenStore from 'Pages/TokenStore';
import { FetchProfileMessage } from 'Plugins/DoctorAPI/FetchProfileMessage'; // Import your fetch function
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils'; // Import your API utility
import { QueryReceivedMessage } from 'Plugins/NotificationAPI/QueryReceivedMessage'; // Import your fetch notifications function

export function Dashboard() {
    const history = useHistory();
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const { Id, setId } = useIdStore();
    const { setToken } = useTokenStore();
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [notifications, setNotifications] = useState<{ content: string; releaserName: string }[]>([]); // State to hold notifications

    useEffect(() => {
        const fetchProfile = async () => {
            const fetchProfileMessage = new FetchProfileMessage(parseInt(Id)); // Adjust as necessary
            try {
                const response = await sendPostRequest(fetchProfileMessage);
                setProfileImage(response.data); // Assuming the response contains the profileImage URL
            } catch (error) {
                console.error('Error fetching profile:', error);
            }
        };

        const fetchNotifications = async () => {
            const fetchNotificationsMessage = new QueryReceivedMessage(parseInt(Id)); // Pass the student ID
            try {
                const response = await sendPostRequest(fetchNotificationsMessage);
                setNotifications(response.data); // Assuming the response is a JSON array
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        fetchProfile();
        fetchNotifications(); // Fetch notifications on mount
    }, [Id]); // Add Id as a dependency

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
