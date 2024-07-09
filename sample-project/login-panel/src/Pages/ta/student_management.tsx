import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils'; // Adjust import path based on your project structure
import { AssignTAMessage } from 'Plugins/StudentAPI/AssignTAMessage'; // Adjust import path based on your project structure
import useIdStore from 'Pages/IdStore'; // Adjust import path based on your file structure


export const AssignTA = () => {
    const history = useHistory();
    const { Id } = useIdStore(); // Zustand hook to get student Id
    const [taId, setTaId] = useState('');
    const [error, setError] = useState('');

    const handleAssignTA = async () => {
        try {
            const studentIdNumber = parseInt(Id); // Convert student ID to number if needed

            // Construct the AssignTAMessage object
            const assignTAMessage = new AssignTAMessage(studentIdNumber, parseInt(taId));

            // Send the registration request
            const response = await sendPostRequest(assignTAMessage);

            console.log('Assign TA Response:', response);

            if (response && response.data === 'Success') {
                history.push('/ta_dashboard'); // Redirect to dashboard on successful assignment
            } else {
                setError('Assigning TA failed. Please try again.');
            }
        } catch (error) {
            console.error('Assign TA Error:', error.message);
            setError('Assigning TA failed. Please try again.');
        }
    };

    const handleTaIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setTaId(value);
    };

    return (
        <div className="assignTA-container">
            <div className="assignTA-box">
                <header className="assignTA-header">
                    <h1>Assign TA</h1>
                    <p>Please assign a TA to the student</p>
                </header>
                <main>
                    {error && <p className="error-message">{error}</p>}
                    <div className="form-group">
                        <label htmlFor="studentId">Student ID</label>
                        <input
                            type="text"
                            id="studentId"
                            value={Id}
                            readOnly
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="taId">TA ID</label>
                        <input
                            type="text"
                            id="taId"
                            value={taId}
                            onChange={handleTaIdChange}
                            required
                        />
                    </div>
                    <button className="button" onClick={handleAssignTA}>
                        Assign TA
                    </button>
                </main>
            </div>
        </div>
    );
};

export default AssignTA;