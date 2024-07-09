import React, { useState } from 'react';
import { useHistory } from 'react-router';
// Import the CSS file (create if not exists)
import useStudentIdStore from 'Pages/studentIdStore'; // Adjust the path based on your file structure

export const runupload: React.FC = () => {
    const history = useHistory();
    const { studentId } = useStudentIdStore(); // Assuming you have access to studentId from Zustand
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [finishTime, setFinishTime] = useState<Date | null>(null);
    const [distance, setDistance] = useState<string>('');
    const [clickCount, setClickCount] = useState<number>(0);
    const [submitted, setSubmitted] = useState<boolean>(false);

    const handleStartRunning = () => {
        setClickCount(clickCount + 1);

        if (clickCount === 0) {
            // First click
            setStartTime(new Date());
            // Implement sending start running message with studentId
            console.log(`Start running message sent with studentId: ${studentId}`);
        } else if (clickCount === 1) {
            // Second click
            setFinishTime(new Date());
            // Store timestamp or implement further logic
            console.log('Finish timestamp stored:', finishTime);
        }
    };

    const handleSubmit = () => {
        // Implement your submission logic (e.g., sending data to backend)
        console.log('Submitting run data:', { startTime, finishTime, distance });

        // Set submitted flag to true
        setSubmitted(true);

        // Optionally reset state
        setStartTime(null);
        setFinishTime(null);
        setDistance('');
    };

    const handleCancel = () => {
        // Navigate back to the main page
        history.push("/");
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