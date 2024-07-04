import React, { useState } from 'react';
import axios, { isAxiosError } from 'axios';
import { API } from 'Plugins/CommonUtils/API';
import { useHistory } from 'react-router';
import './Main.css'; // Import the CSS file

export function Main() {
    const history = useHistory();
    const [dropdownVisible, setDropdownVisible] = useState(false);

    const sendPostRequest = async (message: API) => {
        try {
            const response = await axios.post(message.getURL(), JSON.stringify(message), {
                headers: { 'Content-Type': 'application/json' },
            });
            console.log('Response status:', response.status);
            console.log('Response body:', response.data);
        } catch (error) {
            if (isAxiosError(error)) {
                if (error.response && error.response.data) {
                    console.error('Error sending request:', error.response.data);
                } else {
                    console.error('Error sending request:', error.message);
                }
            } else {
                console.error('Unexpected error:', error);
            }
        }
    };

    const toggleDropdown = () => {
        setDropdownVisible(!dropdownVisible);
    };

    const handleUserConfig = () => {
        history.push("/config");
    };

    const handleLogin = () => {
        history.push("/login"); // Navigate to /login route
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>Physical Exercise System</h1>
                <div className="user-section">
                    <button className="btn login-btn" onClick={handleLogin}>Login</button>
                    <div className="user-avatar" onClick={toggleDropdown}>👤</div>
                    {dropdownVisible && (
                        <div className="dropdown-menu">
                            <p onClick={handleUserConfig}>User Config</p>
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