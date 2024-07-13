import React, { useState } from 'react';
import useIdStore from 'Pages/IdStore';
import { TASignMessage } from 'Plugins/GroupExAPI/TASignMessage';
import { ExQueryMessage } from 'Plugins/GroupExAPI/ExQueryMessage'; // Import your ExQueryMessage
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';

interface ExerciseCardProps {
    groupexID: number;
    startTime: string;
    finishTime: string;
    location: string;
    exName: string;
    status: number;
    updateStatus: (newStatus: number) => void; // Function to update the status
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
                                                       groupexID,
                                                       startTime,
                                                       finishTime,
                                                       location,
                                                       exName,
                                                       status,
                                                       updateStatus,
                                                   }) => {
    const { Id } = useIdStore(); // Get TA ID from Zustand store
    const taId = parseInt(Id);
    const [token, setToken] = useState('');
    const [error, setError] = useState<string>('');
    const [inProcess, setInProcess] = useState<boolean>(false);
    const [queryResult, setQueryResult] = useState<any[]>([]); // State to hold query results
    const isOngoing = (Date.now() >= parseInt(startTime) && Date.now() <= parseInt(finishTime) && status !== 4);

    const handleSignIn = async () => {
        if (!token) {
            setError('请填写token。');
            return;
        }
        setError('');

        try {
            const response = await sendPostRequest(new TASignMessage(groupexID, taId, 1, token));
            if (response.status === 200) {
                setError('签到成功！');
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
                setError('结束签到成功！');
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
                setError('签退成功！');
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
                setError('结束签退成功！');
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
        setError(''); // Clear previous errors

        try {
            const response = await sendPostRequest(new ExQueryMessage(groupexID, queryType));
            if (response.status === 200) {
                setQueryResult(response.data); // Set the results to state
            } else {
                setError('查询失败，请重试。');
            }
        } catch {
            setError('查询失败，请重试。');
        }
    };

    return (
        <div className="exercise-card">
            <h4>{exName}</h4>
            <p>开始时间: {new Date(parseInt(startTime)).toLocaleString()}</p>
            <p>结束时间: {new Date(parseInt(finishTime)).toLocaleString()}</p>
            <p>地点: {location}</p>
            {error && <p className="error-message">{error}</p>}

            {isOngoing && (
                <div>
                    <input
                        type="text"
                        placeholder="输入token"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        disabled={status === 1 || status === 3} // Disable input for sign-out and end sign-out
                    />
                    <button onClick={handleAction} disabled={inProcess}>
                        {status === 0 ? '开始签到' :
                            status === 1 ? '结束签到' :
                                status === 2 ? '开始签退' :
                                    status === 3 ? '结束签退' :
                                        '无效操作'}
                    </button>
                </div>
            )}

            {inProcess && <p>签到和签退已完成</p>}

            <div className="query-buttons">
                <button onClick={() => handleQueryStatus(1)}>显示签到情况</button>
                <button onClick={() => handleQueryStatus(0)}>显示签退情况</button>
                <button onClick={() => handleQueryStatus(2)}>显示整体情况</button>
            </div>

            {queryResult.length > 0 && (
                <div className="query-results">
                    <h5>查询结果:</h5>
                    <ul>
                        {queryResult.map((item) => (
                            <li key={item.studentID}>{item.studentID}</li> // Use studentID from response
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ExerciseCard;
