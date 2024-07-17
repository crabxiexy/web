import React, { useEffect, useState } from 'react';
import useIdStore from './IdStore'; // Import the IdStore
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import { FetchNameMessage } from 'Plugins/DoctorAPI/FetchNameMessage';
import { FetchProfileMessage } from 'Plugins/DoctorAPI/FetchProfileMessage';
import { useHistory } from 'react-router';
import './Sidebar.css';
import useTokenStore from './TokenStore';
const Sidebar = () => {
    const { Id, setId } = useIdStore(); // Get ID and setId from the Zustand store
    const [username, setUsername] = useState('Guest'); // Default username
    const [profileImage, setProfileImage] = useState<string | null>(null); // Profile image state
    const [dropdownVisible, setDropdownVisible] = useState(false); // State for dropdown visibility
    const history = useHistory();
    const {setToken}=useTokenStore();
    useEffect(() => {
        const fetchUsername = async () => {
            if (Id) {
                try {
                    const response = await sendPostRequest(new FetchNameMessage(parseInt(Id)));
                    setUsername(response.data || 'Guest'); // Set username or fallback to 'Guest'
                } catch (error) {
                    console.error('Error fetching username:', error);
                }
            }
        };

        const fetchProfile = async () => {
            if (Id) {
                try {
                    const response = await sendPostRequest(new FetchProfileMessage(parseInt(Id)));
                    setProfileImage(response.data); // Set profile image
                } catch (error) {
                    console.error('Error fetching profile:', error);
                }
            }
        };

        fetchUsername();
        fetchProfile();
    }, [Id]);

    const toggleDropdown = () => {
        setDropdownVisible(!dropdownVisible); // Toggle dropdown visibility
    };

    const handleLogout = () => {
        setId(''); // Clear ID
        setToken(''); // Clear token
        history.push('/'); // Redirect to home
    };

    return (
        <div className="sidebar">
            <h1>Physical Exercise System</h1> {/* Move the title here */}
            <div className="user-avatar" onClick={toggleDropdown}>
                {profileImage && (
                    <img src={profileImage} alt="User Avatar" className="avatar-image" />
                )}
                <span>{username}</span>
            </div>
            {dropdownVisible && ( // Conditionally render the dropdown menu
                <div className="dropdown-menu">
                    <p onClick={() => history.push("/profile")}>Profile</p>
                    <p onClick={() => history.push("/help")}>Help</p>
                    <p onClick={handleLogout}>Logout</p> {/* Logout button */}
                </div>
            )}
        </div>
    );
};

export default Sidebar;
