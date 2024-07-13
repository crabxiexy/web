import React, { useState } from 'react';
import { useHistory } from 'react-router';
import './dashboard.css'; // Import the CSS file
import useIdStore from 'Pages/IdStore'; // Adjust the path based on your file structure

export function Dashboard() { // Renamed first letter to uppercase to follow component naming conventions.
    const history = useHistory();
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const { setId } = useIdStore();

    const toggleDropdown = () => {
        setDropdownVisible(!dropdownVisible);
    };

    const handleProfile = () => {
        history.push("/profile");
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

    const handleLogout = () => {
        setId('');
        history.push("/");
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>Physical Exercise System</h1>
                <div className="user-section">
                    <button className="btn login-btn" onClick={handleLogout}>Logout</button>
                    <div className="user-avatar" onClick={toggleDropdown}>👤</div>
                    {dropdownVisible && (
                        <div className="dropdown-menu">
                            <p onClick={handleRename}>Rename</p>
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
            </main>
        </div>
    );
}

export default Dashboard;