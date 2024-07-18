import React from 'react';
import student_exercisecard_style from './student_ExerciseCard.module.css';

interface ExerciseCardProps {
    groupexID: number;
    startTime: string;
    finishTime: string;
    location: string;
    exName: string;
    status: number;
    onSignin: (groupexID: number, token: string) => void;
    onSignout: (groupexID: number, token: string) => void;
}

const Student_ExerciseCard: React.FC<ExerciseCardProps> = ({
                                                       groupexID,
                                                       startTime,
                                                       finishTime,
                                                       location,
                                                       exName,
                                                       status,
                                                       onSignin,
                                                       onSignout,
                                                   }) => {
    const [token, setToken] = React.useState<string>('');

    const formatStatus = (status: number) => {
        switch (status) {
            case 0:
                return '签到未开始';
            case 1:
                return '签到已开始';
            case 2:
                return '签到已结束';
            case 3:
                return '签退已开始';
            case 4:
                return '已结束';
            default:
                return '状态未知';
        }
    };

    return (
        <div className={student_exercisecard_style.exerciseCard}>
            <h4>{exName}</h4>
            <p>开始时间: {new Date(parseInt(startTime)).toLocaleString()}</p>
            <p>结束时间: {new Date(parseInt(finishTime)).toLocaleString()}</p>
            <p>地点: {location}</p>
            <p>状态: {formatStatus(status)}</p>
            {status === 1 && (
                <div className={student_exercisecard_style.SignInSection}>
                    <input
                        className={student_exercisecard_style.tokenInput}
                        type="text"
                        placeholder="请输入Token"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                    />
                    <button className={student_exercisecard_style.button} onClick={() => onSignin(groupexID, token)}>签到</button>
                </div>
            )}
            {status === 3 && (
                <div className={student_exercisecard_style.SignOutSection}>
                    <input
                        className={student_exercisecard_style.tokenInput}
                        type="text"
                        placeholder="请输入Token"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                    />
                    <button className={student_exercisecard_style.button} onClick={() => onSignout(groupexID, token)}>签退</button>
                </div>
            )}
        </div>
    );
};

export default Student_ExerciseCard;