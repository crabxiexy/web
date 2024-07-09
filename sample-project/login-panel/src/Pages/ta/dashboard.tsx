import React, { useState } from 'react';
import { useHistory } from 'react-router';
import useStudentIdStore from 'Pages/studentIdStore'; // Adjust the path based on your file structure

export function dashboard() {
    const history = useHistory();
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const { setStudentId } = useStudentIdStore();

    const toggleDropdown = () => {
        setDropdownVisible(!dropdownVisible);
    };

    const handleRename = () => {
        history.push("/rename");
    };

    const handleRunUpload = () => {
        history.push("/student_runupload");
    };

    const handleLogout = () => {
        setStudentId('');
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

                <section className="activities">
                    <h2>Activities for Department Team</h2>
                    <div className="button-group">
                        {/* Add your activity buttons here */}
                    </div>
                </section>

                <section className="common-exercises">
                    <h2>Common Exercises</h2>
                    <div className="button-group">
                        {/* Add your exercise buttons here */}
                    </div>
                </section>
            </main>
        </div>
    );
}

export default dashboard;