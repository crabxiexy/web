import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import useIdStore from 'Pages/IdStore';
import { StudentQueryMessage } from 'Plugins/GroupExAPI/StudentQueryMessage';
import { SigninMessage } from 'Plugins/GroupExAPI/SigninMessage';
import { SignoutMessage } from 'Plugins/GroupExAPI/SignoutMessage';
import ExerciseCard from './ExerciseCard';
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

    const currentTime = new Date();

    const notStarted = studentQueryResult.filter(item => new Date(item.starttime) > currentTime);
    const ongoing = studentQueryResult.filter(item => {
        const startTime = new Date(item.starttime);
        const finishTime = new Date(item.finishtime);
        return startTime <= currentTime && finishTime >= currentTime;
    });
    const ended = studentQueryResult.filter(item => new Date(item.finishtime) < currentTime || item.status === 4);

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

    // Function to format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString(); // Customize this format as needed
    };

    return (
        <div className="check-groupex-container">
            <h1>学生锻炼查询</h1>
            {error && <p className="error-message">{error}</p>}

            <h3>未开始:</h3>
            {notStarted.map(item => (
                <ExerciseCard
                    key={item.groupexID}
                    groupexID={item.groupexID}
                    startTime={item.starttime}
                    finishTime={item.finishtime}
                    location={item.location}
                    exName={item.ex_name}
                    status={item.status}
                    onSignin={handleSignin}
                    onSignout={handleSignout}
                />
            ))}

            <h3>正在进行:</h3>
            {ongoing.map(item => (
                <ExerciseCard
                    key={item.groupexID}
                    groupexID={item.groupexID}
                    startTime={item.starttime}
                    finishTime={item.finishtime}
                    location={item.location}
                    exName={item.ex_name}
                    status={item.status}
                    onSignin={handleSignin}
                    onSignout={handleSignout}
                />
            ))}

            <h3>已结束:</h3>
            {ended.map(item => (
                <ExerciseCard
                    key={item.groupexID}
                    groupexID={item.groupexID}
                    startTime={item.starttime}
                    finishTime={item.finishtime}
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
                        <td>{new Date(parseInt(record.start_time)).toLocaleString()}</td>
                        <td>{new Date(parseInt(record.finish_time)).toLocaleString()}</td>
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
