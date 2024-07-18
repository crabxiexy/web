import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import SyncLoader from "react-spinners/SyncLoader";
import main_styles from './Main.module.css'; // Import the CSS module

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
        <div className={`${main_styles.minHScreen}`}>
            <header className={main_styles.header}>
                <h1>乐动力 Pro</h1>
                <div className={"flex items-center space-x-4"}>
                    <button className={`${main_styles.btn}`} onClick={handleLogin}>登录</button>
                    <button className={`${main_styles.btn}`} onClick={handleRegister}>注册（仅内测）</button>
                </div>
            </header>
            {loading ? (
                <div className={main_styles.loaderContainer}>
                    <SyncLoader color={"#123abc"} loading={loading} size={30}/>
                </div>
            ) : (
                <main className={main_styles.mainContent}>
                    <section className={main_styles.section}>
                        <h2>Notifications</h2>
                        <div className={main_styles.notificationBoard}>
                            <p>Don't forget to warm up before exercising!</p>
                            <p>Drink plenty of water.</p>
                            <p>Team Yoga session at 10 AM tomorrow.</p>
                            <p>Friday Cycling Event has been rescheduled to 8 AM.</p>
                        </div>
                    </section>

                    <section className={main_styles.section}>
                        <h2>Activities for Department Team</h2>
                        <div className={main_styles.notificationBoard}>
                            <p>Login to see activities released.</p>
                        </div>
                    </section>

                    <section className={main_styles.section}>
                        <h2>Common Exercises</h2>
                        <div className={main_styles.notificationBoard}>
                            <p>Login to see exercise list.</p>
                        </div>
                    </section>
                </main>
            )}
        </div>
    );
}