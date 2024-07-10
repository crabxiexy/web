import React, { useState } from 'react';
import { useHistory } from 'react-router';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import { RenameMessage } from 'Plugins/DoctorAPI/RenameMessage';
import './login.css';
import useIdStore from './IdStore'; // Adjust the path based on your file structure

export function Rename() {
    const history = useHistory();
    const [old_password, setOldPassword] = useState('');
    const [new_password, setNewPassword] = useState('');
    const [error, setError] = useState('');

    // Retrieve studentId from Zustand store
    const studentId = useIdStore(state => state.Id);

    const handleRename = async () => {
        try {
            // Convert studentId to number (if needed)
            const idNumber = parseInt(studentId); // Ensure it matches the expected type

            // Create RenameMessage object
            const renameMessage = new RenameMessage(idNumber,old_password,new_password);

            // Send POST request with RenameMessage
            const response = await sendPostRequest(renameMessage);

            console.log('Rename Response:', response);

            // Handle successful response (example: redirect to root)
            history.push('/admin/root');

        } catch (error) {
            console.error('Rename Error:', error.message);
            setError(error.message); // Update state with error message
        }
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>HTTP Post Requests</h1>
            </header>
            <main>
                <div className="login-container">
                    <h2>Rename</h2>

                    {error && <p className="error-message">{error}</p>}
                    <div className="form-group">
                        <label>Old Password</label>
                        <input
                            type="text"
                            value={old_password}
                            onChange={e => setOldPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>New Password</label>
                        <input
                            type="password"
                            value={new_password}
                            onChange={e => setNewPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button onClick={handleRename}>
                        Submit
                    </button>
                    <button onClick={() => history.push("/admin/root")}>
                        Back
                    </button>
                </div>
            </main>
        </div>
    );
}