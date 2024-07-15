import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import './dashboard.css'; // Import the CSS file
import useIdStore from 'Pages/IdStore'; // Adjust the path based on your file structure
import useTokenStore from 'Pages/TokenStore';
import { FetchProfileMessage } from 'Plugins/DoctorAPI/FetchProfileMessage'; // Import your fetch function
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils'; // Import your API utility

export function Dashboard() {
    const history = useHistory();
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const { Id,setId } = useIdStore();
    const { setToken } = useTokenStore();
    const [profileImage, setProfileImage] = useState<string | null>(null);

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

        fetchProfile();
    }, []);

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
                        <p>Don't forget to warm up before exercising!</p>
                        <p>Drink plenty of water.</p>
                        <p>Team Yoga session at 10 AM tomorrow.</p>
                        <p>Friday Cycling Event has been rescheduled to 8 AM.</p>
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