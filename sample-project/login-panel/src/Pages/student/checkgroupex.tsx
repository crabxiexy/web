import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import useIdStore from 'Pages/IdStore';
import { StudentQueryMessage } from 'Plugins/GroupExAPI/StudentQueryMessage';
import { SigninMessage } from 'Plugins/GroupExAPI/SigninMessage';
import { SignoutMessage } from 'Plugins/GroupExAPI/SignoutMessage';
import Student_ExerciseCard from './student_ExerciseCard';
import { StudentRecordQueryMessage } from 'Plugins/GroupExAPI/StudentRecordQueryMessage';

export const Checkgroupex: React.FC = () => {
    const history = useHistory();
    const { Id } = useIdStore();
    const [studentQueryResult, setStudentQueryResult] = useState<any[]>([]);
    const [studentRecord, setStudentRecord] = useState<any[]>([]);
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

        const fetchStudentRecordData = async () => {
            const studentRecordMessage = new StudentRecordQueryMessage(parseInt(Id));
            try {
                const response = await sendPostRequest(studentRecordMessage);
                setStudentRecord(response.data);
            } catch (error) {
                setError('学生记录查询失败，请重试。');
            }
        };

        fetchGroupexData();
        fetchStudentRecordData();
    }, [Id]);

    const current = new Date();
    const currentTime = new Date(current.getTime()-8* 60 * 60 * 1000);

    const parseTimestamp = (timestamp: string) => {
        const parsedTime = parseInt(timestamp, 10);
        if (isNaN(parsedTime)) {
            console.error('Invalid timestamp format:', timestamp);
            return null;
        }
        return new Date(parsedTime); // 创建日期对象
    };

    const notStarted = studentQueryResult.filter(item => {
        const startTime = parseTimestamp(item.starttime);
        return startTime && startTime > currentTime;
    });

    const ongoing = studentQueryResult.filter(item => {
        const startTime = parseTimestamp(item.starttime);
        const finishTime = parseTimestamp(item.finishtime);

        return startTime && finishTime && startTime <= currentTime && finishTime >= currentTime && item.status !== 4;
    });

    const ended = studentQueryResult.filter(item => {
        const finishTime = parseTimestamp(item.finishtime);
        return finishTime && (finishTime < currentTime || item.status === 4);
    });

    const handleSignin = async (groupexID: number, token: string) => {
        if (!token) {
            setError('请填写token。');
            return;
        }
        const signinMessage = new SigninMessage(parseInt(Id), groupexID, token);
        try {
            await sendPostRequest(signinMessage);
            alert('签到成功！');
        } catch (error) {
            setError('签到失败，请重试。');
        }
    };

    const handleSignout = async (groupexID: number, token: string) => {
        const signoutMessage = new SignoutMessage(parseInt(Id), groupexID, token);
        try {
            await sendPostRequest(signoutMessage);
            alert('签退成功！');
        } catch (error) {
            setError('签退失败，请重试。');
        }
    };

    const formatDate = (timestamp: string) => {
        const localTime = new Date(parseInt(timestamp) + 8 * 60 * 60 * 1000);
        return localTime.getTime().toString();
    };

    return (
        <div className="check-groupex-container">
            <h1>学生锻炼查询</h1>
            {error && <p className="error-message">{error}</p>}

            <h3>未开始:</h3>
            {notStarted.map(item => (
                <Student_ExerciseCard
                    key={item.groupexID}
                    groupexID={item.groupexID}
                    startTime={formatDate(item.starttime)}
                    finishTime={formatDate(item.finishtime)}
                    location={item.location}
                    exName={item.ex_name}
                    status={item.status}
                    onSignin={handleSignin}
                    onSignout={handleSignout}
                />
            ))}

            <h3>正在进行:</h3>
            {ongoing.map(item => (
                <Student_ExerciseCard
                    key={item.groupexID}
                    groupexID={item.groupexID}
                    startTime={formatDate(item.starttime)}
                    finishTime={formatDate(item.finishtime)}
                    location={item.location}
                    exName={item.ex_name}
                    status={item.status}
                    onSignin={handleSignin}
                    onSignout={handleSignout}
                />
            ))}

            <h3>已结束:</h3>
            {ended.map(item => (
                <Student_ExerciseCard
                    key={item.groupexID}
                    groupexID={item.groupexID}
                    startTime={formatDate(item.starttime)}
                    finishTime={formatDate(item.finishtime)}
                    location={item.location}
                    exName={item.ex_name}
                    status={item.status}
                    onSignin={handleSignin}
                    onSignout={handleSignout}
                />
            ))}

            <h3>学生记录:</h3>
            <table>
                <thead>
                <tr>
                    <th>Group Exercise ID</th>
                    <th>Start Time</th>
                    <th>Finish Time</th>
                    <th>签到状态</th>
                    <th>签退状态</th>
                </tr>
                </thead>
                <tbody>
                {studentRecord.map(record => (
                    <tr key={record.groupex_id}>
                        <td>{record.groupex_id}</td>
                        <td>{formatDate(record.start_time)}</td>
                        <td>{formatDate(record.finish_time)}</td>
                        <td>{record.has_signed_in ? '是' : '否'}</td>
                        <td>{record.has_signed_out ? '是' : '否'}</td>
                    </tr>
                ))}
                </tbody>
            </table>

            <button className="button" onClick={() => history.push('/student_dashboard')}>
                返回 Student Dashboard
            </button>
        </div>
    );
};

export default Checkgroupex;
