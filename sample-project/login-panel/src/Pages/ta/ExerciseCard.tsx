import React, { useState } from 'react';
import useIdStore from 'Pages/IdStore';
import { TASignMessage } from 'Plugins/GroupExAPI/TASignMessage';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';

interface ExerciseCardProps {
    groupexID: number;
    startTime: string;
    finishTime: string;
    location: string;
    exName: string;
    status: number;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
                                                       groupexID,
                                                       startTime,
                                                       finishTime,
                                                       location,
                                                       exName,
                                                       status,
                                                   }) => {
    const { Id } = useIdStore(); // Get TA ID from Zustand store
    const taId = parseInt(Id);
    const [token, setToken] = useState('');
    const [error, setError] = useState<string>('');
    const [canEndSignIn, setCanEndSignIn] = useState<boolean>(false);
    const [canSignOut, setCanSignOut] = useState<boolean>(false);
    const [canEndSignOut, setCanEndSignOut] = useState<boolean>(false);
    const [inProcess, setInProcess] = useState<boolean>(false);
    const isOngoing = (Date.now() >= parseInt(startTime) && Date.now() <= parseInt(finishTime))&&(status==4);

    const handleSignIn = async () => {
        if (!token) {
            setError('请填写token。');
            return;
        }
        setError('');

        try {
            const response = await sendPostRequest(new TASignMessage(groupexID, taId, 1,  token));
            if (response.status === 200) {
                setError('签到成功！');
                setCanEndSignIn(true);
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
            const response = await sendPostRequest(new TASignMessage(groupexID, taId, 2,  ''));
            if (response.status === 200) {
                setError('结束签到成功！');
                setCanEndSignIn(false);
                setCanSignOut(true);
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
                setCanSignOut(false);
                setCanEndSignOut(true);
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
            const response = await sendPostRequest(new TASignMessage(groupexID, taId, 4,  ''));
            if (response.status === 200) {
                setError('结束签退成功！');
                setInProcess(true);
            } else {
                setError('结束签退失败，请重试。');
            }
        } catch {
            setError('结束签退失败，请重试。');
        }
    };

    const handleAction = async () => {
        if (canEndSignIn) {
            await handleEndSignIn();
        } else if (canSignOut) {
            await handleSignOut();
        } else if (canEndSignOut) {
            await handleEndSignOut();
        } else {
            await handleSignIn();
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
                    />
                    <button onClick={handleAction} disabled={inProcess}>
                        {canEndSignIn ? '结束签到' : canSignOut ? '开始签退' : canEndSignOut ? '结束签退' : '开始签到'}
                    </button>
                </div>
            )}

            {inProcess && <p>签到和签退已完成</p>}
        </div>
    );
};

export default ExerciseCard;
