import React, { useState, useEffect } from 'react';
import useIdStore from 'Plugins/IdStore';
import { TASignMessage } from 'Plugins/GroupExAPI/TASignMessage';
import { ExQueryMessage } from 'Plugins/GroupExAPI/ExQueryMessage';
import { FetchNameMessage } from 'Plugins/DoctorAPI/FetchNameMessage';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import { validateToken } from 'Plugins/ValidateToken'; // Import validateToken
import ta_exercisecard_style from './ta_ExerciseCard.module.css';
import useTokenStore from 'Plugins/TokenStore'

interface ExerciseCardProps {
    groupexID: number;
    startTime: string;
    finishTime: string;
    location: string;
    exName: string;
    status: number;
    updateStatus: (newStatus: number) => void;
    studentIDs: number[];
}

const TA_ExerciseCard: React.FC<ExerciseCardProps> = ({
                                                          groupexID,
                                                          startTime,
                                                          finishTime,
                                                          location,
                                                          exName,
                                                          status,
                                                          updateStatus,
                                                          studentIDs,
                                                      }) => {
    const { Id } = useIdStore();
    const taId = parseInt(Id);
    const [token, setToken] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [inProcess, setInProcess] = useState<boolean>(false);
    const [queryResult, setQueryResult] = useState<any[]>([]);
    const [studentNames, setStudentNames] = useState<{ [key: number]: string }>({});
    const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
    const {Token} = useTokenStore();
    useEffect(() => {
        if (Token) {
            const checkToken = async () => {
                try {
                    const valid = await validateToken(Id,Token);
                    setIsTokenValid(valid);
                } catch {
                    setError('Token 验证失败，请重新登录。');
                    setIsTokenValid(false);
                }
            };
            checkToken();
        }
    }, [Id,Token]);

    const isOngoing = (Date.now() >= parseInt(startTime) && Date.now() <= parseInt(finishTime) && status !== 4);

    const fetchStudentNames = async () => {
        const names: { [key: number]: string } = {};
        for (const studentID of studentIDs) {
            try {
                const response = await sendPostRequest(new FetchNameMessage(studentID));
                names[studentID] = response.data;
            } catch {
                names[studentID] = '未知';
            }
        }
        setStudentNames(names);
    };

    const handleSignIn = async () => {
        if (!isTokenValid) {
            setError('Token 无效。');
            return;
        }
        if (!token) {
            setError('请填写 token。');
            return;
        }
        setError('');

        try {
            const response = await sendPostRequest(new TASignMessage(groupexID, taId, 1, token));
            if (response.status === 200) {
                updateStatus(1);
            } else {
                setError('签到失败，请重试。');
            }
        } catch {
            setError('签到失败，请重试。');
        }
    };

    const handleEndSignIn = async () => {
        if (!isTokenValid) {
            setError('Token 无效。');
            return;
        }
        setError('');

        try {
            const response = await sendPostRequest(new TASignMessage(groupexID, taId, 2, ''));
            if (response.status === 200) {
                updateStatus(2);
            } else {
                setError('结束签到失败，请重试。');
            }
        } catch {
            setError('结束签到失败，请重试。');
        }
    };

    const handleSignOut = async () => {
        if (!isTokenValid) {
            setError('Token 无效。');
            return;
        }
        if (!token) {
            setError('请填写 token。');
            return;
        }
        setError('');

        try {
            const response = await sendPostRequest(new TASignMessage(groupexID, taId, 3, token));
            if (response.status === 200) {
                updateStatus(3);
            } else {
                setError('签退失败，请重试。');
            }
        } catch {
            setError('签退失败，请重试。');
        }
    };

    const handleEndSignOut = async () => {
        if (!isTokenValid) {
            setError('Token 无效。');
            return;
        }
        setError('');

        try {
            const response = await sendPostRequest(new TASignMessage(groupexID, taId, 4, ''));
            if (response.status === 200) {
                setInProcess(true);
                updateStatus(4);
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
        if (!isTokenValid) {
            setError('Token 无效。');
            return;
        }
        setError('');

        try {
            const response = await sendPostRequest(new ExQueryMessage(groupexID, queryType));
            if (response.status === 200) {
                setQueryResult(response.data);
                await fetchStudentNames();
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
                        placeholder="输入 token"
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
                    <h5>查询结果</h5>
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
