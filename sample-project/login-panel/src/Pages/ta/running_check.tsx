import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils'; // Adjust import path based on your project structure
import { CheckRunningMessage } from 'Plugins/RunAPI/CheckRunningMessage'; // Adjust import path based on your project structure
import useIdStore from 'Pages/IdStore';
import { TAQueryRunningMessage } from 'Plugins/RunAPI/TAQueryRunningMessage' // Adjust import path based on your file structure


export const RunningCheck = () => {
    const history = useHistory();
    const { Id } = useIdStore(); // Zustand hook to get student Id
    const [error, setError] = useState('');

    const QueryRunning = async () => {
        try {
            const taIdNumber = parseInt(Id); // Convert student ID to number if needed

            // Construct the AssignTAMessage object
            const TAQueryMessage = new TAQueryRunningMessage(taIdNumber);

            // Send the registration request
            const response = await sendPostRequest(TAQueryMessage);

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


    return (
        <div className="Query-container">
            <div className="Query-box">
                <header className="Query-header">
                    <h1>Assign TA</h1>
                    <p>Please assign a TA to the student</p>
                </header>
                <main>
                    {error && <p className="error-message">{error}</p>}

                    <button className="button" onClick={QueryRunning}>
                        Query unchecked
                    </button>
                </main>
            </div>
        </div>
    );
};

export default RunningCheck;