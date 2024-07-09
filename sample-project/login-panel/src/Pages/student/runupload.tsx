import React, { useState } from 'react';
import { useHistory } from 'react-router';
import useIdStore from 'Pages/IdStore';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import { StartRunningMessage } from 'Plugins/RunAPI/StartRunningMessage' // Adjust the path based on your file structure

export const runupload: React.FC = () => {
    const history = useHistory();
    const { Id } = useIdStore(); // Assuming you have access to studentId from Zustand
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [finishTime, setFinishTime] = useState<Date | null>(null);
    const [distance, setDistance] = useState<string>('');
    const [clickCount, setClickCount] = useState<number>(0);
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [runId, setRunId] = useState<string>(''); // State to store the run_id

    const handleStartRunning = async () => {
        setClickCount(clickCount + 1);

        if (clickCount === 0) {
            // First click
            setStartTime(new Date());

            try {
                // Send start running message and get run_id
                const studentIdNumber=parseInt(Id);
                const startrunningMessage = new StartRunningMessage(studentIdNumber);
                const response = await sendPostRequest(startrunningMessage)


                console.log('Start Running Message Response:', response);

                // Assuming your backend returns the run_id
                if (response && response.data && response.data.run_id) {
                    setRunId(response.data.run_id);
                }
            } catch (error) {
                console.error('Error sending start running message:', error.message);
                // Handle error as needed
            }
        } else if (clickCount === 1) {
            // Second click
            setFinishTime(new Date());
            console.log('Finish timestamp stored:', finishTime);
        }
    };

    const handleSubmit = () => {
        // Implement your submission logic (e.g., sending data to backend)
        console.log('Submitting run data:', { startTime, finishTime, distance, runId });

        // Set submitted flag to true
        setSubmitted(true);

        // Optionally reset state
        setStartTime(null);
        setFinishTime(null);
        setDistance('');
    };

    const handleCancel = () => {
        // Navigate back to the main page
        history.push("/student_dashboard");
    };

    const handleDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDistance(e.target.value);
    };

    return (
        <div className="run-upload-page">
            <h1>Run Upload</h1>
            <div className="timestamp-box">
                <p>Start Time: {startTime ? startTime.toLocaleString() : '-'}</p>
                <p>Finish Time: {finishTime ? finishTime.toLocaleString() : '-'}</p>
            </div>
            <div className="distance-input">
                <label htmlFor="distance">Distance (in kilometers):</label>
                <input
                    type="number"
                    id="distance"
                    value={distance}
                    onChange={handleDistanceChange}
                    step="0.1"
                    min="0"
                    required
                />
            </div>
            <div className="button-group">
                <button className="start-button" onClick={handleStartRunning}>
                    {clickCount === 0 ? 'Start Running' : 'Finish Running'}
                </button>
                <button className="submit-button" onClick={handleSubmit}>
                    Submit
                </button>
                <button className="cancel-button" onClick={handleCancel}>
                    Cancel
                </button>
            </div>
            {submitted && <p className="submitted-message">Run data submitted successfully!</p>}
        </div>
    );
};

export default runupload;