import React, { useEffect, useState } from 'react';
import useIdStore from './IdStore'; // Import the IdStore
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import { FetchNameMessage } from 'Plugins/DoctorAPI/FetchNameMessage';
import { useHistory } from 'react-router';

const Sidebar = () => {
    const { Id } = useIdStore(); // Get ID from the Zustand store
    const [username, setUsername] = useState('Guest'); // Default username
    const [dropdownVisible, setDropdownVisible] = useState(false); // State for dropdown visibility
    const history = useHistory();

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

        fetchUsername();
    }, [Id]);

    const toggleDropdown = () => {
        setDropdownVisible(!dropdownVisible); // Toggle dropdown visibility
    };

    return (
        <div className="sidebar">
            <div className="user-avatar" onClick={toggleDropdown}>
                <span>{username}</span>
            </div>
            {dropdownVisible && ( // Conditionally render the dropdown menu
                <div className="dropdown-menu">
                    <p onClick={() => history.push("/profile")}>Profile</p>
                    <p onClick={() => history.push("/help")}>Help</p>
                </div>
            )}
        </div>
    );
};

export default Sidebar;
