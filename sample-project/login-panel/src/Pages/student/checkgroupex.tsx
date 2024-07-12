import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import useIdStore from 'Pages/IdStore';
import { StudentQueryMessage } from 'Plugins/GroupExAPI/StudentQueryMessage';
import ExerciseCard from './ExerciseCard';

export const Checkgroupex: React.FC = () => {
    const history = useHistory();
    const { Id } = useIdStore();
    const [studentQueryResult, setStudentQueryResult] = useState<any[]>([]);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const fetchGroupexData = async () => {
            const studentQueryMessage = new StudentQueryMessage(parseInt(Id));
            try {
                const response = await sendPostRequest(studentQueryMessage);
                setStudentQueryResult(response.data);
            } catch (error) {
                setError('查询失败，请重试。');
            }
        };

        fetchGroupexData();
    }, [Id]);

    const notStarted = studentQueryResult.filter(item => item.status === 0);
    const ongoing = studentQueryResult.filter(item =>
        item.status === 1 || item.status === 2 || item.status === 3
    );
    const ended = studentQueryResult.filter(item => item.status === 4);

    return (
        <div className="check-groupex-container">
            <h1>学生锻炼查询</h1>
            {error && <p className="error-message">{error}</p>}

            <h3>未开始:</h3>
            {notStarted.map(item => (
                <ExerciseCard
                    key={item.groupexID}
                    groupexID={item.groupexID}
                    startTime={item.startTime}
                    finishTime={item.finishTime}
                    location={item.location}
                    exName={item.ex_name}
                    status={item.status}
                />
            ))}

            <h3>正在进行:</h3>
            {ongoing.map(item => (
                <ExerciseCard
                    key={item.groupexID}
                    groupexID={item.groupexID}
                    startTime={item.startTime}
                    finishTime={item.finishTime}
                    location={item.location}
                    exName={item.ex_name}
                    status={item.status}
                />
            ))}

            <h3>已结束:</h3>
            {ended.map(item => (
                <ExerciseCard
                    key={item.groupexID}
                    groupexID={item.groupexID}
                    startTime={item.startTime}
                    finishTime={item.finishTime}
                    location={item.location}
                    exName={item.ex_name}
                    status={item.status}
                />
            ))}

            <button className="button" onClick={() => history.push('/student_dashboard')}>
                返回 Student Dashboard
            </button>
        </div>
    );
};

export default Checkgroupex;
