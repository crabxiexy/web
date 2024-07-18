import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import { TAQueryRunningMessage } from 'Plugins/RunAPI/TAQueryRunningMessage';
import useIdStore from 'Pages/IdStore';
import { CheckRunningMessage } from 'Plugins/RunAPI/CheckRunningMessage';
import Modal from 'react-modal';
import { FetchNameMessage } from 'Plugins/DoctorAPI/FetchNameMessage';
import { ReleaseNotificationMessage } from 'Plugins/NotificationAPI/ReleaseNotificationMessage';
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

export const RunningCheck = () => {
    const history = useHistory();
    const [error, setError] = useState<string>('');
    const [result, setResult] = useState<Run[]>([]);
    const [editData, setEditData] = useState<{ [key: number]: { response?: string } }>({});
    const [modalOpen, setModalOpen] = useState<{ [key: number]: boolean }>({});
    const [selectedImageUrl, setSelectedImageUrl] = useState<string>('');
    const { Id } = useIdStore();

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
        setModalOpen((prev) => ({ ...prev, [runId]: true }));
    };

    const closeModal = (runId: number) => {
        setModalOpen((prev) => ({ ...prev, [runId]: false }));
        setSelectedImageUrl('');
    };

    const sendNotification = async (studentId: number, taName: string, status: 'approved' | 'rejected', response: string) => {
        const message = status === 'approved'
            ? `你提交的跑步记录被批准，回复是: ${response}`
            : `你提交的跑步记录被驳回，回复是: ${response}`;

        const notificationMessage = new ReleaseNotificationMessage(taName, parseInt(Id), studentId, message);
        await sendPostRequest(notificationMessage);
    };

    const fetchStudentName = async (studentId: number) => {
        const fetchMessage = new FetchNameMessage(studentId);
        const response = await sendPostRequest(fetchMessage);
        return response.data; // Adjust based on your API response structure
    };

    const handleCheck = async (runId: number, studentId: number) => {
        const { response = '' } = editData[runId] || {}; // Default to empty string if undefined
        const checkRunningMessage = new CheckRunningMessage(runId, 1, response);

        try {
            await sendPostRequest(checkRunningMessage);
            setResult((prevResult) => prevResult.filter((run) => run.runID !== runId));
            // Send notification after approval
            const taName = await fetchStudentName(parseInt(Id)); // Fetch TA name based on the runId or your logic
            await sendNotification(studentId, taName, 'approved', response); // Use studentID here
        } catch (error) {
            setError('提交失败，请重试。');
        }
    };

    const handleReject = async (runId: number, studentId: number) => {
        const { response = '' } = editData[runId] || {}; // Default to empty string if undefined
        const checkRunningMessage = new CheckRunningMessage(runId, 2, response);

        try {
            await sendPostRequest(checkRunningMessage);
            setResult((prevResult) => prevResult.filter((run) => run.runID !== runId));
            // Send notification after rejection
            const taName = await fetchStudentName(parseInt(Id)); // Fetch TA name based on the runId or your logic
            await sendNotification(studentId, taName, 'rejected', response); // Use studentID here
        } catch (error) {
            setError('提交失败，请重试。');
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.runningCheckContainer}>
                <h1 className={styles.runningCheckHeader}>Running Check</h1>
                {error && <p className={styles.errorMessage}>{error}</p>}
                <div className={styles.buttonGroup}>
                    <button className={styles.button} onClick={() => history.push('/ta_dashboard')}>
                        返回 TA 仪表盘
                    </button>
                    <button className={styles.button} onClick={handleTAQuery}>
                        执行 TA 查询
                    </button>
                </div>
                {result.length > 0 && (
                    <div className={styles.queryResult}>
                        <h3>TA 查询结果:</h3>
                        <table className={styles.table}>
                            <thead>
                            <tr>
                                <th>学生姓名</th>
                                <th>开始时间</th>
                                <th>结束时间</th>
                                <th>提交时间</th>
                                <th>距离</th>
                                <th>查看图片</th>
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
                                        <input
                                            type="text"
                                            value={editData[run.runID]?.response ?? run.response}
                                            onChange={(e) =>
                                                handleFieldChange(run.runID, 'response', e.target.value)
                                            }
                                        />
                                    </td>
                                    <td>{run.speed.toFixed(2)}</td>
                                    <td>
                                        <button className={styles.button} onClick={() => handleCheck(run.runID,run.studentID)}>
                                            通过
                                        </button>
                                        <button className={styles.button} onClick={() => handleReject(run.runID,run.studentID)}>
                                            拒绝
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {result.map((run) => (
                    <Modal
                        key={run.runID}
                        isOpen={modalOpen[run.runID] || false}
                        onRequestClose={() => closeModal(run.runID)}
                        contentLabel="Image Modal"
                        className={styles.imageModal}
                        overlayClassName={styles.imageModalOverlay}
                    >
                        <div className={styles.modalContent}>
                            <button className={styles.closeButton} onClick={() => closeModal(run.runID)}>
                                &times;
                            </button>
                            <img
                                src={run.imgurl}
                                alt="Selected"
                                className={styles.modalImage}
                            />
                        </div>
                    </Modal>
                ))}
            </div>
        </div>
    );
};

export default RunningCheck;
