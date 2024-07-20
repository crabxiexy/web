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
        <div className={`${main_styles.min_h_screen}`}>
            <header className={main_styles.header}>
                <h1>乐动力 Pro</h1>
                <div className={`${main_styles.buttonGroup}`}>
                    <button className={`${main_styles.btn}`} onClick={handleLogin}>登录</button>
                </div>
            </header>
            {loading ? (
                <div className={main_styles.loaderContainer}>
                    <SyncLoader color={"#123abc"} loading={loading} size={30}/>
                </div>
            ) : (
                <main className={main_styles.mainContent}>
                    <section className={main_styles.section}>
                        <h2>通知栏</h2>
                        <div className={main_styles.notificationBoard}>
                            <p>登录以查看通知</p>
                        </div>
                    </section>

                    <section className={main_styles.section}>
                        <h2>俱乐部活动</h2>
                        <div className={main_styles.notificationBoard}>
                            <p>登录以查看活动</p>
                        </div>
                    </section>

                    <section className={main_styles.section}>
                        <h2>日常锻炼</h2>
                        <div className={main_styles.notificationBoard}>
                            <p>登录以查看和管理日常锻炼</p>
                        </div>
                    </section>
                </main>
            )}
        </div>
    );
}