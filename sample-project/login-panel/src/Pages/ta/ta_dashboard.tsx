import React, { useState } from 'react';
import { useHistory } from 'react-router';
import useIdStore from 'Pages/IdStore'; // Adjust the path based on your file structure
import './dashboard.css'; // Ensure the correct path to your CSS file

export function TA_dashboard() {
    const history = useHistory();
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const { setId } = useIdStore();

    const toggleDropdown = () => {
        setDropdownVisible(!dropdownVisible);
    };

    const handleRename = () => {
        history.push("/rename");
    };

    const handleStudentManagement = () => {
        history.push("/ta_student_management");
    };

    const handleLogout = () => {
        setId('');
        history.push("/");
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
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
                <div className="square-block" onClick={handleStudentManagement}>
                    学生管理
                </div>
                {/* Add other sections or components here */}
            </main>
        </div>
    );
}

export default TA_dashboard;