import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import { AssignTAMessage } from 'Plugins/StudentAPI/AssignTAMessage';
import { CheckTokenMessage } from 'Plugins/DoctorAPI/CheckTokenMessage'; // Import the CheckTokenMessage
import useIdStore from 'Pages/IdStore';
import useTokenStore from 'Pages/TokenStore'; // Assuming you store the token here
import './student_management.css'; // Import the CSS file for styling

export const AssignTA = () => {
    const history = useHistory();
    const { Id } = useIdStore();
    const token = useTokenStore(state => state.Token); // Retrieve the token
    const [studentId, setStudentId] = useState(0);
    const [error, setError] = useState('');
    const [username, setUsername] = useState('Guest');
    const [dropdownVisible, setDropdownVisible] = useState(false);

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            setUsername(storedUsername);
        }
    }, []);

    const handleAssignTA = async () => {
        try {
            // Check the token before proceeding
            const taIdNumber = parseInt(Id);
            const checkTokenMessage = new CheckTokenMessage(taIdNumber, token);
            const tokenResponse = await sendPostRequest(checkTokenMessage);

            if (tokenResponse.data === "Token is valid.") {
                const assignTAMessage = new AssignTAMessage(studentId, taIdNumber);
                const response = await sendPostRequest(assignTAMessage);

                if (response && response.data === 'Success') {
                    history.push('/ta_dashboard');
                } else {
                    setError('Assigning TA failed. Please try again.');
                }
            } else {
                setError("Token is invalid or expired."); // Handle invalid token case
                history.push("/login"); // Redirect to login
            }
        } catch (error) {
            setError('Assigning TA failed. Please try again.');
        }
    };

    const toggleDropdown = () => setDropdownVisible(!dropdownVisible);

    const goBack = () => {
        history.goBack();
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>Assign TA</h1>
                <div className="user-section">
                    <div className="user-avatar" onClick={toggleDropdown}>{username}</div>
                    {dropdownVisible && (
                        <div className="dropdown-menu">
                            <p>Profile</p>
                            <p>Help</p>
                        </div>
                    )}
                </div>
            </header>
            <main>
                {error && <p className="error-message">{error}</p>}
                <div className="form-container">
                    <button className="btn back-btn" onClick={goBack}>Back</button>
                    <div className="form-group">
                        <label htmlFor="studentId">Student ID</label>
                        <input
                            type="number"
                            id="studentId"
                            value={studentId}
                            onChange={e => setStudentId(parseInt(e.target.value))}
                            required
                            placeholder="Enter Student ID"
                        />
                    </div>
                    <button className="btn assign-btn" onClick={handleAssignTA}>
                        Assign TA
                    </button>
                </div>
            </main>
        </div>
    );
};