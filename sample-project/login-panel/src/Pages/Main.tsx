import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import SyncLoader from "react-spinners/SyncLoader";
import './Main.css';

export function Main(): JSX.Element {
    const history = useHistory();
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [username, setUsername] = useState('Guest');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            setUsername(storedUsername);
        }
        setTimeout(() => setLoading(false), 2000); // Simulate a 2-second loading time
    }, []);

    const toggleDropdown = (): void => {
        setDropdownVisible(!dropdownVisible);
    };

    const handleProfile = (): void => {
        history.push("/profile");
    };

    const handleHelp = (): void => {
        history.push("/help");
    };

    const handleRegister = (): void => {
        history.push("/register");
    };

    const handleLogin = (): void => {
        history.push("/login");
    };

    return (
        <div className="min-h-screen flex-col bg-gray-100">
            <header className="header">
                <h1>Physical Exercise System</h1>
                <div className="flex items-center space-x-4">
                    <button className="btn btn-blue" onClick={handleLogin}>Login</button>
                    <button className="btn btn-green" onClick={handleRegister}>Register</button>
                    <div className="relative">
                        <div className="user-avatar" onClick={toggleDropdown}>{username}</div>
                        {dropdownVisible && (
                            <div className="dropdown-menu">
                                <p onClick={handleProfile}>Profile</p>
                                <p onClick={handleHelp}>Help</p>
                            </div>
                        )}
                    </div>
                </div>
            </header>
            {loading ? (
                <div className="flex items-center justify-center h-screen">
                    <SyncLoader color={"#123abc"} loading={loading} size={10} />
                </div>
            ) : (
                <main className="main-content">
                    <section className="section">
                        <h2>Notifications</h2>
                        <div className="notification-board">
                            <p>Don't forget to warm up before exercising!</p>
                            <p>Drink plenty of water.</p>
                            <p>Team Yoga session at 10 AM tomorrow.</p>
                            <p>Friday Cycling Event has been rescheduled to 8 AM.</p>
                        </div>
                    </section>

                    <section className="section">
                        <h2>Activities for Department Team</h2>
                        <div className="button-group">
                            {/* Buttons for activities */}
                        </div>
                    </section>

                    <section className="section">
                        <h2>Common Exercises</h2>
                        <div className="button-group">
                            {/* Buttons for common exercises */}
                        </div>
                    </section>
                </main>
            )}
        </div>
    );
}