import React, { useState } from 'react';
import { useHistory } from 'react-router';
import 'Pages/Main.css'; // Import the CSS file
import useStudentIdStore from 'Pages/studentIdStore';
export function root() {
    const history = useHistory();
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const { setStudentId } = useStudentIdStore();
    const toggleDropdown = () => {
        setDropdownVisible(!dropdownVisible);
    };

    const handleProfile = () => {
        history.push("/profile");
    };

    const handleHelp = () => {
        history.push("/help");
    };

    const handleRename = () => {
        history.push("/rename");
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

                <section className="activities">
                    <h2>Activities for Department Team</h2>
                    <div className="button-group">
                        {/*<button className="btn activity-btn" onClick={() => sendPostRequest(new API('teamYogaEndpoint'))}>Team Yoga</button>*/}
                        {/*<button className="btn activity-btn" onClick={() => sendPostRequest(new API('departmentRunEndpoint'))}>Department Run</button>*/}
                        {/*<button className="btn activity-btn" onClick={() => sendPostRequest(new API('cyclingTogetherEndpoint'))}>Cycling Together</button>*/}
                    </div>
                </section>

                <section className="common-exercises">
                    <h2>Common Exercises</h2>
                    <div className="button-group">
                        {/*<button className="btn exercise-btn" onClick={() => sendPostRequest(new API('sunshineRunningEndpoint'))}>Sunshine Running</button>*/}
                        {/*<button className="btn exercise-btn" onClick={() => sendPostRequest(new API('exerciseTogetherEndpoint'))}>Exercise Together</button>*/}
                    </div>
                </section>
            </main>
        </div>
    );
}