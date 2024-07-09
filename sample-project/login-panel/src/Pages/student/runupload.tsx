import React, { useState } from 'react';
import { useHistory } from 'react-router';
import useIdStore from 'Pages/IdStore';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import { SubmitRunningMessage } from 'Plugins/RunAPI/StartRunningMessage';

export const runupload: React.FC = () => {
    const history = useHistory();
    const { Id } = useIdStore();
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [finishTime, setFinishTime] = useState<Date | null>(null);
    const [distance, setDistance] = useState<string>('');
    const [clickCount, setClickCount] = useState<number>(0);
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [runId, setRunId] = useState<string>('');

    const handleStartRunning = async () => {
        setClickCount(prevCount => prevCount + 1);

        if (clickCount === 0) {
            const start = new Date();
            setStartTime(start);

            try {
                const studentIdNumber = parseInt(Id);
                const startRunningMessage = new SubmitRunningMessage(studentIdNumber, start, start, 0, new Uint8Array());
                const response = await sendPostRequest(startRunningMessage);

                console.log('Start Running Message Response:', response);

                if (response && response.data && response.data.run_id) {
                    setRunId(response.data.run_id);
                }
            } catch (error) {
                console.error('Error sending start running message:', error.message);
            }
        } else if (clickCount === 1) {
            setFinishTime(new Date());
        }
    };

    const handleSubmit = async () => {
        if (startTime && finishTime && distance && runId) {
            const studentIdNumber = parseInt(Id);
            const distanceNumber = parseFloat(distance);
            const submitMessage = new SubmitRunningMessage(studentIdNumber, startTime, finishTime, distanceNumber, new Uint8Array());

            try {
                const response = await sendPostRequest(submitMessage);
                console.log('Submit Running Message Response:', response);
                setSubmitted(true);
            } catch (error) {
                console.error('Error submitting run data:', error.message);
            }
        }
    };

    const handleCancel = () => {
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
                <button className="submit-button" onClick={handleSubmit} disabled={!finishTime || !distance}>
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