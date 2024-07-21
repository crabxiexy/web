import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import { TAQueryRunningMessage } from 'Plugins/RunAPI/TAQueryRunningMessage';
import useIdStore from 'Plugins/IdStore';
import useTokenStore from 'Plugins/TokenStore';
import { CheckRunningMessage } from 'Plugins/RunAPI/CheckRunningMessage';
import Modal from 'react-modal';
import { FetchNameMessage } from 'Plugins/DoctorAPI/FetchNameMessage';
import { ReleaseNotificationMessage } from 'Plugins/NotificationAPI/ReleaseNotificationMessage';
import { validateToken } from 'Plugins/ValidateToken'; // Import validateToken
import Sidebar from "Pages/Sidebar";
import styles from './running_check.module.css'; // Import the CSS module

Modal.setAppElement('#root');

interface Run {
    runID: number;
    studentID: number;
    starttime: string;
    finishtime: string;
    submittime: string;
    distance: number;
    imgurl: string;
    response: string;
    speed: number;
    studentName: string;
}

export const RunningCheck: React.FC = () => {
    const history = useHistory();
    const [error, setError] = useState<string>('');
    const [result, setResult] = useState<Run[]>([]);
    const [editData, setEditData] = useState<{ [key: number]: { response?: string } }>({});
    const [modalOpen, setModalOpen] = useState<number | null>(null);
    const [selectedImageUrl, setSelectedImageUrl] = useState<string>('');
    const { Id } = useIdStore();
    const { Token } = useTokenStore(); // Get Token from the store

    useEffect(() => {
        handleTAQuery();
    }, []);

    const decodeTimestamp = (timestamp: string): string => {
        const date = new Date(parseInt(timestamp));
        return date.toLocaleString();
    };

    const handleTAQuery = async () => {
        try {
            const taQueryMessage = new TAQueryRunningMessage(parseInt(Id));
            const response = await sendPostRequest(taQueryMessage);
            if (response && response.data) {
                const enrichedResults = await Promise.all(response.data.map(async (run: Run) => {
                    const studentName = await fetchStudentName(run.studentID);
                    return {
                        ...run,
                        speed: calculateSpeed(run.distance, run.starttime, run.finishtime),
                        studentName,
                    };
                }));
                setResult(enrichedResults);
                setError('');
            } else {
                setError('TA 查询失败，请重试。');
            }
        } catch (error) {
            setError('TA 查询失败，请重试。');
        }
    };

    const calculateSpeed = (distance: number, startTime: string, finishTime: string): number => {
        const startTimestamp = parseInt(startTime);
        const finishTimestamp = parseInt(finishTime);
        const timeDifference = (finishTimestamp - startTimestamp) / 1000;
        return distance / 10 / (timeDifference / 60);
    };

    const handleFieldChange = (runId: number, fieldName: 'response', value: string) => {
        setEditData((prevData) => ({
            ...prevData,
            [runId]: {
                ...prevData[runId],
                [fieldName]: value,
            },
        }));
    };

    const handleImageClick = (imageUrl: string, runId: number) => {
        setSelectedImageUrl(imageUrl);
        setModalOpen(runId);
    };

    const closeModal = () => {
        setModalOpen(null);
        setSelectedImageUrl('');
    };

    const sendNotification = async (studentId: number, taName: string, status: 'approved' | 'rejected', response: string) => {
        const message = status === 'approved'
            ? `你提交的跑步记录被批准，回复是: ${response}`
            : `你提交的跑步记录被驳回，回复是: ${response}`;

        const notificationMessage = new ReleaseNotificationMessage(parseInt(Id), studentId, message);
        await sendPostRequest(notificationMessage);
    };

    const fetchStudentName = async (studentId: number) => {
        const fetchMessage = new FetchNameMessage(studentId);
        const response = await sendPostRequest(fetchMessage);
        return response.data; // Adjust based on your API response structure
    };

    const handleAction = async (runId: number, studentId: number, status: number) => {
        const isValidToken = await validateToken(Id, Token);
        if (!isValidToken) {
            setError('Token is invalid. Please log in again.');
            history.push('/login'); // Redirect to login page
            return;
        }

        const { response = '' } = editData[runId] || {}; // Default to empty string if undefined
        const checkRunningMessage = new CheckRunningMessage(runId, status, response);

        try {
            await sendPostRequest(checkRunningMessage);
            setResult((prevResult) => prevResult.filter((run) => run.runID !== runId));
            const taName = await fetchStudentName(parseInt(Id));
            await sendNotification(studentId, taName, status === 1 ? 'approved' : 'rejected', response);
        } catch (error) {
            setError('提交失败，请重试。');
        }
    };

    return (
        <div className={styles.App}>
            <Sidebar />
            <div className={styles.runningCheckContainer}>
                <h1 className={styles.runningCheckHeader}>Running Check</h1>
                {error && <p className={styles.errorMessage}>{error}</p>}
                {result.length > 0 && (
                    <div className={styles.queryResult}>
                        <h3>查询结果</h3>
                        <table className={styles.table}>
                            <thead>
                            <tr>
                                <th>学生姓名</th>
                                <th>开始时间</th>
                                <th>结束时间</th>
                                <th>提交时间</th>
                                <th>距离</th>
                                <th>证明图片</th>
                                <th>回复</th>
                                <th>速度 (km/h)</th>
                                <th>操作</th>
                            </tr>
                            </thead>
                            <tbody>
                            {result.map((run) => (
                                <tr key={run.runID}>
                                    <td>{run.studentName}</td>
                                    <td>{decodeTimestamp(run.starttime)}</td>
                                    <td>{decodeTimestamp(run.finishtime)}</td>
                                    <td>{decodeTimestamp(run.submittime)}</td>
                                    <td>{(run.distance / 10).toFixed(2)}</td>
                                    <td>
                                        <button
                                            className={styles.button}
                                            onClick={() => handleImageClick(run.imgurl, run.runID)}
                                        >
                                            查看图片
                                        </button>
                                    </td>
                                    <td>
                                            <textarea
                                                value={editData[run.runID]?.response || ''}
                                                onChange={(e) => handleFieldChange(run.runID, 'response', e.target.value)}
                                                placeholder="输入回复"
                                            />
                                    </td>
                                    <td>{run.speed.toFixed(2)}</td>
                                    <td>
                                        <button
                                            className={styles.button}
                                            onClick={() => handleAction(run.runID, run.studentID, 1)}
                                        >
                                            通过
                                        </button>
                                        <button
                                            className={styles.button}
                                            onClick={() => handleAction(run.runID, run.studentID, 2)}
                                        >
                                            驳回
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {modalOpen !== null && (
                    <Modal
                        isOpen={modalOpen !== null}
                        onRequestClose={closeModal}
                        className={styles.modal}
                        overlayClassName={styles.overlay}
                    >
                        <img src={selectedImageUrl} alt="Proof" className={styles.modalImage} />
                        <button className={styles.closeButton} onClick={closeModal}>
                            关闭
                        </button>
                    </Modal>
                )}
            </div>
        </div>
    );
};

export default RunningCheck;
