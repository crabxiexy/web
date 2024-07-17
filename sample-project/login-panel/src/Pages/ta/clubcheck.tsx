import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import { TAQueryHWMessage } from 'Plugins/ActivityAPI/TAQueryHWMessage';
import Modal from 'react-modal';
import useIdStore from 'Pages/IdStore';
import { FetchNameMessage } from 'Plugins/DoctorAPI/FetchNameMessage';
import { ReleaseNotificationMessage } from 'Plugins/NotificationAPI/ReleaseNotificationMessage';
import { CheckHWMessage } from 'Plugins/ActivityAPI/CheckHWMessage';

Modal.setAppElement('#root');

interface Homework {
    activity_id: number;
    student_id: number;
    submitTime: string;
    imgUrl: string;
    club_name: string;
    activity_name: string;
    intro: string;
    startTime: string;
    finishTime: string;
    organizor_id: number;
    student_names: string[];
}

export const ClubHWCheck = () => {
    const history = useHistory();
    const [error, setError] = useState<string>('');
    const [result, setResult] = useState<Homework[]>([]);
    const [editResponse, setEditResponse] = useState<{ [key: number]: string }>({});
    const [modalOpen, setModalOpen] = useState<{ [key: number]: boolean }>({});
    const [selectedImageUrl, setSelectedImageUrl] = useState<string>('');
    const { Id } = useIdStore();

    useEffect(() => {
        handleTAQuery();
    }, []);

    const handleTAQuery = async () => {
        try {
            const taQueryMessage = new TAQueryHWMessage(parseInt(Id));
            const response = await sendPostRequest(taQueryMessage);
            if (response && response.data) {
                const enrichedResults = await Promise.all(response.data.map(async (homework: Homework) => {
                    const studentNames = await fetchStudentNames(homework.student_id);
                    return {
                        ...homework,
                        student_names: studentNames,
                    };
                }));
                // Grouping homework by activity_id
                const groupedResults = groupByActivity(enrichedResults);
                setResult(groupedResults);
                setError('');
            } else {
                setError('TA 查询失败，请重试。');
            }
        } catch (error) {
            setError('TA 查询失败，请重试。');
        }
    };

    const fetchStudentNames = async (studentId: number): Promise<string[]> => {
        const fetchMessage = new FetchNameMessage(studentId);
        const response = await sendPostRequest(fetchMessage);
        return response.data ? [response.data] : [];
    };

    const groupByActivity = (homeworks: Homework[]) => {
        const grouped = homeworks.reduce((acc, homework) => {
            const { activity_id } = homework;
            if (!acc[activity_id]) {
                acc[activity_id] = { ...homework, student_names: [] };
            }
            acc[activity_id].student_names.push(...homework.student_names);
            return acc;
        }, {} as { [key: number]: Homework });

        return Object.values(grouped);
    };

    const handleImageClick = (imageUrl: string, activityId: number) => {
        setSelectedImageUrl(imageUrl);
        setModalOpen((prev) => ({ ...prev, [activityId]: true }));
    };

    const closeModal = (activityId: number) => {
        setModalOpen((prev) => ({ ...prev, [activityId]: false }));
        setSelectedImageUrl('');
    };

    const sendNotification = async (studentId: number, taName: string, status: 'approved' | 'rejected', response: string) => {
        const message = status === 'approved'
            ? `你提交的作业被批准，回复是: ${response}`
            : `你提交的作业被驳回，回复是: ${response}`;

        const notificationMessage = new ReleaseNotificationMessage(taName, parseInt(Id), studentId, message);
        await sendPostRequest(notificationMessage);
    };

    const handleCheck = async (activityId: number, status: number) => {
        const responses = result.filter(hw => hw.activity_id === activityId).map(hw => ({
            activity_id: hw.activity_id,
            student_id: hw.student_id,
            response: editResponse[activityId] || ''
        }));

        try {
            await Promise.all(responses.map(async ({ activity_id, student_id, response }) => {
                const checkMessage = new CheckHWMessage(activity_id, status, response);
                await sendPostRequest(checkMessage);
                const taName = await fetchStudentNames(student_id);
                await sendNotification(student_id, taName[0], status === 1 ? 'approved' : 'rejected', response);
            }));

            setResult((prevResult) => prevResult.filter((hw) => hw.activity_id !== activityId));
        } catch (error) {
            setError('提交失败，请重试。');
        }
    };

    const handleBatchCheck = async (activityId: number) => {
        await handleCheck(activityId, 1); // Approve
    };

    const handleBatchReject = async (activityId: number) => {
        await handleCheck(activityId, 2); // Reject
    };

    return (
        <div className="club-hw-check-container">
            <h1>作业检查</h1>
            {error && <p className="error-message">{error}</p>}
            <div className="button-group">
                <button className="button" onClick={() => history.push('/ta_dashboard')}>
                    返回 TA 仪表盘
                </button>
            </div>
            {result.length > 0 && (
                <div className="query-result">
                    <h3>待检查作业:</h3>
                    <table className="table">
                        <thead>
                        <tr>
                            <th>学生姓名</th>
                            <th>提交时间</th>
                            <th>俱乐部名称</th>
                            <th>活动名称</th>
                            <th>查看图片</th>
                            <th>回复</th>
                            <th>操作</th>
                        </tr>
                        </thead>
                        <tbody>
                        {result.map((homework) => (
                            <tr key={homework.activity_id}>
                                <td>{homework.student_names.join(', ')}</td>
                                <td>{homework.submitTime}</td>
                                <td>{homework.club_name}</td>
                                <td>{homework.activity_name}</td>
                                <td>
                                    <button
                                        className="button"
                                        onClick={() => handleImageClick(homework.imgUrl, homework.activity_id)}
                                    >
                                        查看图片
                                    </button>
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        value={editResponse[homework.activity_id] ?? ''}
                                        onChange={(e) =>
                                            setEditResponse((prevData) => ({
                                                ...prevData,
                                                [homework.activity_id]: e.target.value,
                                            }))
                                        }
                                    />
                                </td>
                                <td>
                                    <button className="button" onClick={() => handleBatchCheck(homework.activity_id)}>
                                        批量通过
                                    </button>
                                    <button className="button" onClick={() => handleBatchReject(homework.activity_id)}>
                                        批量拒绝
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
            {result.map((homework) => (
                <Modal
                    key={homework.activity_id}
                    isOpen={modalOpen[homework.activity_id] || false}
                    onRequestClose={() => closeModal(homework.activity_id)}
                    contentLabel="Image Modal"
                    className="image-modal"
                    overlayClassName="image-modal-overlay"
                >
                    <div className="modal-header">
                        <button className="close-button" onClick={() => closeModal(homework.activity_id)}>
                            &times;
                        </button>
                    </div>
                    <div className="modal-body">
                        <img
                            src={homework.imgUrl}
                            alt="Selected"
                            style={{ maxWidth: '100%', maxHeight: '100%' }}
                        />
                    </div>
                </Modal>
            ))}
        </div>
    );
};

export default ClubHWCheck;
