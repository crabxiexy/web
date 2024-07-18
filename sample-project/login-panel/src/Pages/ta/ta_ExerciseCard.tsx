import React, { useState } from 'react';
import useIdStore from 'Pages/IdStore';
import { TASignMessage } from 'Plugins/GroupExAPI/TASignMessage';
import { ExQueryMessage } from 'Plugins/GroupExAPI/ExQueryMessage';
import { FetchNameMessage } from 'Plugins/DoctorAPI/FetchNameMessage'; // Import the FetchNameMessage
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import ta_exercisecard_style from './ta_ExerciseCard.module.css';

interface ExerciseCardProps {
    groupexID: number;
    startTime: string;
    finishTime: string;
    location: string;
    exName: string;
    status: number;
    updateStatus: (newStatus: number) => void;
    studentIDs: number[]; // Accept student IDs as a prop
}

const TA_ExerciseCard: React.FC<ExerciseCardProps> = ({
                                                       groupexID,
                                                       startTime,
                                                       finishTime,
                                                       location,
                                                       exName,
                                                       status,
                                                       updateStatus,
                                                       studentIDs, // Include studentIDs here
                                                   }) => {
    const { Id } = useIdStore();
    const taId = parseInt(Id);
    const [token, setToken] = useState('');
    const [error, setError] = useState<string>('');
    const [inProcess, setInProcess] = useState<boolean>(false);
    const [queryResult, setQueryResult] = useState<any[]>([]);
    const [studentNames, setStudentNames] = useState<{ [key: number]: string }>({}); // Store names by ID

    const isOngoing = (Date.now() >= parseInt(startTime) && Date.now() <= parseInt(finishTime) && status !== 4);

    const fetchStudentNames = async () => {
        const names: { [key: number]: string } = {};
        for (const studentID of studentIDs) {
            try {
                const response = await sendPostRequest(new FetchNameMessage(studentID));
                names[studentID] = response.data;
            } catch {
                names[studentID] = '未知'; // Default if name fetch fails
            }
        }
        setStudentNames(names);
    };

    const handleSignIn = async () => {
        if (!token) {
            setError('请填写token。');
            return;
        }
        setError('');

        try {
            const response = await sendPostRequest(new TASignMessage(groupexID, taId, 1, token));
            if (response.status === 200) {
                updateStatus(1); // Update status to 1 (end sign in)
            } else {
                setError('签到失败，请重试。');
            }
        } catch {
            setError('签到失败，请重试。');
        }
    };

    const handleEndSignIn = async () => {
        setError('');

        try {
            const response = await sendPostRequest(new TASignMessage(groupexID, taId, 2, ''));
            if (response.status === 200) {
                updateStatus(2); // Update status to 2 (start sign out)
            } else {
                setError('结束签到失败，请重试。');
            }
        } catch {
            setError('结束签到失败，请重试。');
        }
    };

    const handleSignOut = async () => {
        if (!token) {
            setError('请填写token。');
            return;
        }
        setError('');

        try {
            const response = await sendPostRequest(new TASignMessage(groupexID, taId, 3, token));
            if (response.status === 200) {
                updateStatus(3); // Update status to 3 (end sign out)
            } else {
                setError('签退失败，请重试。');
            }
        } catch {
            setError('签退失败，请重试。');
        }
    };

    const handleEndSignOut = async () => {
        setError('');

        try {
            const response = await sendPostRequest(new TASignMessage(groupexID, taId, 4, ''));
            if (response.status === 200) {
                setInProcess(true);
                updateStatus(4); // Update status to 4 (completed)
            } else {
                setError('结束签退失败，请重试。');
            }
        } catch {
            setError('结束签退失败，请重试。');
        }
    };

    const handleAction = async () => {
        switch (status) {
            case 0:
                await handleSignIn();
                break;
            case 1:
                await handleEndSignIn();
                break;
            case 2:
                await handleSignOut();
                break;
            case 3:
                await handleEndSignOut();
                break;
            default:
                setError('无效的操作。');
        }
    };

    const handleQueryStatus = async (queryType: number) => {
        setError('');

        try {
            const response = await sendPostRequest(new ExQueryMessage(groupexID, queryType));
            if (response.status === 200) {
                setQueryResult(response.data);
                studentIDs = response.data;// Set the results to state
                await fetchStudentNames(); // Fetch student names after getting query results
            } else {
                setError('查询失败，请重试。');
            }
        } catch {
            setError('查询失败，请重试。');
        }
    };

    return (
        <div className={ta_exercisecard_style.exerciseCard}>
            <h4>{exName}</h4>
            <p>开始时间: {new Date(parseInt(startTime)).toLocaleString()}</p>
            <p>结束时间: {new Date(parseInt(finishTime)).toLocaleString()}</p>
            <p>地点: {location}</p>
            {error && <p className={ta_exercisecard_style.errorMessage}>{error}</p>}

            {isOngoing && (
                <div>
                    <input
                        className={ta_exercisecard_style.tokenInput}
                        type="text"
                        placeholder="输入token"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        disabled={status === 1 || status === 3}
                    />
                    <button className={ta_exercisecard_style.button} onClick={handleAction} disabled={inProcess}>
                        {status === 0 ? '开始签到' :
                            status === 1 ? '结束签到' :
                                status === 2 ? '开始签退' :
                                    status === 3 ? '结束签退' :
                                        '无效操作'}
                    </button>
                </div>
            )}

            {inProcess && <p>签到和签退已完成</p>}

            <div className={ta_exercisecard_style.queryButtons}>
                <button className={ta_exercisecard_style.button} onClick={() => handleQueryStatus(1)}>显示签到情况</button>
                <button className={ta_exercisecard_style.button} onClick={() => handleQueryStatus(0)}>显示签退情况</button>
                <button className={ta_exercisecard_style.button} onClick={() => handleQueryStatus(2)}>显示整体情况</button>
            </div>

            {queryResult.length > 0 && (
                <div className={ta_exercisecard_style.queryResults}>
                    <h5>查询结果:</h5>
                    <ul>
                        {queryResult.map((item) => (
                            <li key={item}>
                                {studentNames[item]} {/* Display student name */}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default TA_ExerciseCard;