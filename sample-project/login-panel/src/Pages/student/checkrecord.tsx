import React, { useState, useEffect } from 'react';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils'; // 根据项目结构调整导入路径
import { StudentQueryRunningMessage } from 'Plugins/RunAPI/StudentQueryRunningMessage'; // 根据项目结构调整导入路径
import useIdStore from 'Pages/IdStore';
import { useHistory } from 'react-router';

// 定义每个跑步记录的接口
interface Run {
    runID: number;
    starttime: string;
    finishtime: string;
    submittime: string;
    distance: number;
    imgurl: string;
    is_checked: number; // 假设 is_checked 存储为数字 (0, 1, 2)
    response: string;
}

export const CheckRecord = ({ studentId }: { studentId: number }) => {
    const history = useHistory();
    const { Id } = useIdStore();
    const [error, setError] = useState<string>('');
    const [records, setRecords] = useState<Run[]>([]);

    const handleCancel = () => {
        history.push('/student_dashboard');
    };

    // 解码时间戳为可读格式的函数
    const decodeTimestamp = (timestamp: string): string => {
        const date = new Date(parseInt(timestamp));
        return date.toLocaleString(); // 根据需要调整格式
    };

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                const queryMessage = new StudentQueryRunningMessage(parseInt(Id));
                const response = await sendPostRequest(queryMessage);

                if (response && response.data) {
                    // 将时间戳解码为可读格式
                    const decodedRecords = response.data.map((record: Run) => ({
                        ...record,
                        starttime: decodeTimestamp(record.starttime),
                        finishtime: decodeTimestamp(record.finishtime),
                        submittime: decodeTimestamp(record.submittime),
                    }));
                    setRecords(decodedRecords);
                    setError('');
                } else {
                    setError('获取记录失败，请重试。');
                }
            } catch (error) {
                console.error('获取记录错误:', error.message);
                setError('获取记录失败，请重试。');
            }
        };

        fetchRecords();
    }, [studentId, Id]); // 当 studentId 或 Id 改变时重新获取记录

    return (
        <div className="check-record-container">
            <h1>学生跑步记录</h1>
            {error && <p className="error-message">{error}</p>}
            <div className="record-list">
                {records.length > 0 ? (
                    <table className="table">
                        <thead>
                        <tr>
                            <th>开始时间</th>
                            <th>结束时间</th>
                            <th>提交时间</th>
                            <th>距离</th>
                            <th>图片 URL</th>
                            <th>审核状态</th>
                            <th>回复</th>
                        </tr>
                        </thead>
                        <tbody>
                        {records.map((record) => (
                            <tr key={record.runID}>
                                <td>{record.starttime}</td>
                                <td>{record.finishtime}</td>
                                <td>{record.submittime}</td>
                                <td>{record.distance}</td>
                                <td>{record.imgurl}</td>
                                <td>
                                    {record.is_checked === 0
                                        ? '未审核'
                                        : record.is_checked === 1
                                            ? '已通过'
                                            : '被拒绝'}
                                </td>
                                <td>{record.response}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                ) : (
                    <p>暂无记录。</p>
                )}
            </div>
            <button className="cancel-button" onClick={handleCancel}>
                Cancel
            </button>
        </div>
    );
};

export default CheckRecord;
