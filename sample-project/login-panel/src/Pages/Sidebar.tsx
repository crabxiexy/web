import React, { useEffect, useState } from 'react';
import useIdStore from './IdStore';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import { FetchStudentInfoMessage } from 'Plugins/StudentAPI/FetchStudentInfoMessage';
import { FetchProfileMessage } from 'Plugins/DoctorAPI/FetchProfileMessage';
import { useHistory } from 'react-router';
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
            const response = await sendPostRequest(new FetchStudentInfoMessage(parseInt(Id)));
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
                <button className={styles.navButton} onClick={handleBack}>返回</button>
                <div className={styles.userAvatar} onClick={toggleDropdown}>
                    {profileImage && (
                        <img src={profileImage} alt="User Avatar" className={styles.avatarImage} />
                    )}
                    <span className={styles.username}>{username}</span>
                </div>
                {dropdownVisible && (
                    <div className={styles.dropdownMenu}>
                        <p onClick={handleRename}>更改密码</p>
                        <p onClick={handleUpdateProfile}>更改头像</p>
                        <p onClick={handleLogout}>退出</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sidebar;