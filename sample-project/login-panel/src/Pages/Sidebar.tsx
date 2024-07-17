// Sidebar.tsx
import React, { useEffect, useState } from 'react';
import useIdStore from './IdStore';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import { FetchNameMessage } from 'Plugins/DoctorAPI/FetchNameMessage';
import { FetchProfileMessage } from 'Plugins/DoctorAPI/FetchProfileMessage';
import { useHistory } from 'react-router';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';
import useTokenStore from './TokenStore';

const Sidebar = () => {
    const { Id, setId } = useIdStore();
    const [username, setUsername] = useState('Guest');
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const history = useHistory();
    const { setToken } = useTokenStore();

    useEffect(() => {
        if (Id) {
            fetchUsername();
            fetchProfile();
        }
    }, [Id]);

    const fetchUsername = async () => {
        try {
            const response = await sendPostRequest(new FetchNameMessage(parseInt(Id)));
            setUsername(response.data || 'Guest');
        } catch (error) {
            console.error('Error fetching username:', error);
        }
    };

    const fetchProfile = async () => {
        try {
            const response = await sendPostRequest(new FetchProfileMessage(parseInt(Id)));
            setProfileImage(response.data);
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const toggleDropdown = () => {
        setDropdownVisible(!dropdownVisible);
    };

    const handleLogout = () => {
        setId('');
        setToken('');
        history.push('/');
    };

    return (
        <div className={styles.sidebar}>
            <h1 className={styles.title}>Physical Exercise System</h1>
            <NavLink to="/" className={({ isActive }) => (isActive ? `${styles.link} ${styles.active}` : styles.link)}>
                Home
            </NavLink>
            <div className={styles.userAvatar} onClick={toggleDropdown}>
                {profileImage && (
                    <img src={profileImage} alt="User Avatar" className={styles.avatarImage} />
                )}
                <span className={styles.username}>{username}</span>
                <button className={styles.logoutButton} onClick={handleLogout}>Logout</button>
            </div>
            {dropdownVisible && (
                <div className={styles.dropdownMenu}>
                    <p onClick={handleLogout}>Logout</p>
                </div>
            )}
        </div>
    );
};

export default Sidebar;