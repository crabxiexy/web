import React, { useEffect, useState } from 'react';
import useIdStore from 'Plugins/IdStore';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import { FetchNameMessage } from 'Plugins/DoctorAPI/FetchNameMessage';
import { FetchProfileMessage } from 'Plugins/DoctorAPI/FetchProfileMessage';
import { useHistory } from 'react-router';
import styles from './Sidebar.module.css';
import useTokenStore from 'Plugins/TokenStore';

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

    const handleHome = (): void => {
        history.push("/");
    };

    const handleBack = (): void => {
        history.goBack();
    };

    const handleRename = () => {
        history.push("/rename");
    };

    const handleUpdateProfile = () => {
        history.push("/update_profile");
    };

    return (
        <div className={styles.sidebar}>
            <div className={styles.leftSection}>
                <h1 className={styles.title}>乐动力 Pro</h1>
            </div>
            <div className={styles.rightSection}>
                <button className={styles.navButton} onClick={handleBack}>Back</button>
                <div className={styles.userAvatar} onClick={toggleDropdown}>
                    {profileImage && (
                        <img src={profileImage} alt="User Avatar" className={styles.avatarImage} />
                    )}
                    <span className={styles.username}>{username}</span>
                </div>
                {dropdownVisible && (
                    <div className={styles.dropdownMenu}>
                        <p onClick={handleRename}>Rename</p>
                        <p onClick={handleUpdateProfile}>Update Profile</p>
                        <p onClick={handleLogout}>Logout</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sidebar;