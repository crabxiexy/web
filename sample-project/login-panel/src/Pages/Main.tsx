import React, {useEffect, useState} from 'react';
import { useHistory } from 'react-router';
import './Main.css'; // Import the CSS file

export function Main() {
    const history = useHistory();
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [username, setUsername] = useState('Guest')

    useEffect(() => {
        const storedUsername = localStorage.getItem('username'); // Assuming username is stored in local storage
        if (storedUsername) {
            setUsername(storedUsername);
        }
    }, []);

    const toggleDropdown = () => {
        setDropdownVisible(!dropdownVisible);
    };

    const handleProfile = () => {
        history.push("/profile");
    };

    const handleHelp = () => {
        history.push("/help");
    };

    const handleRegister = () => {
        history.push("/register");
    };

    const handleLogin = () => {
        history.push("/login");
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>Physical Exercise System</h1>
                <div className="user-section">
                    <button className="btn login-btn" onClick={handleLogin}>Login</button>
                    <button className="btn login-btn" onClick={handleRegister}>Register</button>
                    <div className="user-avatar" onClick={toggleDropdown}>{username}</div>
                    {dropdownVisible && (
                        <div className="dropdown-menu">
                            <p onClick={handleProfile}>Profile</p>
                            <p onClick={handleHelp}>Help</p>
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