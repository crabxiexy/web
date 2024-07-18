import React, { useState, useEffect } from 'react';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils'; // Adjust the import path as per your project structure
import { StudentQueryRunningMessage } from 'Plugins/RunAPI/StudentQueryRunningMessage'; // Adjust the import path as per your project structure
import { StudentQueryHWMessage } from 'Plugins/ActivityAPI/StudentQueryHWMessage';
import useIdStore from 'Pages/IdStore';
import { useHistory } from 'react-router';
import Modal from 'react-modal'; // Import react-modal component
import { StudentQueryMessage } from 'Plugins/GroupExAPI/StudentQueryMessage';
import { StudentRecordQueryMessage } from 'Plugins/GroupExAPI/StudentRecordQueryMessage';
import Sidebar from 'Pages/Sidebar';
import checkrecord_style from './checkrecord.module.css';

Modal.setAppElement('#root');

interface Run {
    runID: number;
    starttime: string;
    finishtime: string;
    submittime: string;
    distance: number;
    imgurl: string; // Image URL field
    isChecked: number; // Assuming isChecked is stored as a number (0, 1, 2)
    response: string;
    certificate: string; // Assuming each record has a certificate field
}

interface Application {
    groupexID: number;
    starttime: string;
    finishtime: string;
    location: string;
    ex_name: string;
    status: number;
}

interface ClubActivity {
    activity_id: number;
    submitTime: number;
    imgUrl: string;
    is_checked: number;
    response: string;
}

export const CheckRecord: React.FC = () => {
    const status: { [key: number]: string } = {
        0: '未审核',
        1: '已通过',
        2: '不通过',
    };

    const history = useHistory();
    const { Id } = useIdStore();
    const [error, setError] = useState<string>('');
    const [records, setRecords] = useState<Run[]>([]);
    const [studentQueryResult, setStudentQueryResult] = useState<Application[]>([]);
    const [studentRecord, setStudentRecord] = useState<any[]>([]);
    const [clubActivities, setClubActivities] = useState<ClubActivity[]>([]);
    const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);
    const [selectedRecord, setSelectedRecord] = useState<{ imgUrl: string } | null>(null);

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

        const fetchRecords = async () => {
            try {
                const queryMessage = new StudentQueryRunningMessage(parseInt(Id));
                const response = await sendPostRequest(queryMessage);

                if (response && response.data) {
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

        const fetchClubActivities = async () => {
            try {
                const queryMessage = new StudentQueryHWMessage(parseInt(Id));
                const response = await sendPostRequest(queryMessage);

                if (response && response.data) {
                    setClubActivities(response.data);
                    setError('');
                } else {
                    setError('获取俱乐部活动记录失败，请重试。');
                }
            } catch (error) {
                console.error('获取俱乐部活动记录错误:', error.message);
                setError('获取俱乐部活动记录失败，请重试。');
            }
        };

        fetchGroupexData();
        fetchStudentRecordData();
        fetchRecords();
        fetchClubActivities();
    }, [Id]);

    const decodeTimestamp = (timestamp: string): string => {
        const date = new Date(parseInt(timestamp));
        return date.toLocaleString();
    };

    const formatDate = (timestamp: string) => {
        const localTime = new Date(parseInt(timestamp) + 8 * 60 * 60 * 1000);
        return localTime.toISOString();
    };

    const handleCancel = () => {
        history.push('/student_dashboard');
    };

    const handleShowCertificate = (record: { imgUrl: string }) => {
        setSelectedRecord(record);
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setSelectedRecord(null);
    };

    return (
        <div className={checkrecord_style.App}>
            <Sidebar />
            <div className={checkrecord_style.checkRecordContainer}>
                <h1>学生锻炼记录查询</h1>
                {error && <p className={checkrecord_style.errorMessage}>{error}</p>}

                <h3>跑步记录</h3>
                <div className={checkrecord_style.recordList}>
                    {records.length > 0 ? (
                        <table className={checkrecord_style.modernTable}>
                            <thead>
                            <tr>
                                <th>开始时间</th>
                                <th>结束时间</th>
                                <th>提交时间</th>
                                <th>距离</th>
                                <th>照片凭证</th>
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
                                    <td>
                                        <button className={checkrecord_style.button}
                                                onClick={() => handleShowCertificate({imgUrl: record.imgurl})}>
                                            显示凭证
                                        </button>
                                    </td>
                                    <td>{status[record.isChecked]}</td>
                                    <td>{record.response}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>暂无记录。</p>
                    )}
                </div>

                <h3>集体锻炼记录</h3>
                <table className={checkrecord_style.modernTable}>
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

                <h3>俱乐部活动记录</h3>
                <div className={checkrecord_style.activityList}>
                    {clubActivities.length > 0 ? (
                        <table className={checkrecord_style.modernTable}>
                            <thead>
                            <tr>
                                <th>活动 ID</th>
                                <th>提交时间</th>
                                <th>照片凭证</th>
                                <th>审核状态</th>
                                <th>回复</th>
                            </tr>
                            </thead>
                            <tbody>
                            {clubActivities.map((activity) => (
                                <tr key={activity.activity_id}>
                                    <td>{activity.activity_id}</td>
                                    <td>{decodeTimestamp(activity.submitTime.toString())}</td>
                                    <td>
                                        <button className={checkrecord_style.button}
                                                onClick={() => handleShowCertificate({imgUrl: activity.imgUrl})}>
                                            显示凭证
                                        </button>
                                    </td>
                                    <td>{status[activity.is_checked]}</td>
                                    <td>{activity.response}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>暂无记录。</p>
                    )}
                </div>

                <button className={checkrecord_style.cancelButton} onClick={handleCancel}>
                    返回 Student Dashboard
                </button>

                <Modal
                    isOpen={modalIsOpen}
                    onRequestClose={closeModal} // This allows closing by clicking the overlay or pressing ESC
                    contentLabel="Certificate Modal"
                    className={checkrecord_style.certificateModal}
                    overlayClassName={checkrecord_style.certificateModalOverlay}
                >
                    <div className={checkrecord_style.modalHeader}>
                        <button className={checkrecord_style.closeButton} onClick={closeModal}>&times;</button>
                    </div>
                    <div className={checkrecord_style.modalBody}>
                        <h2>凭证信息</h2>
                        {selectedRecord && (
                            <img src={selectedRecord.imgUrl} alt="Certificate" style={{ maxWidth: '60%', maxHeight: '60%' }}/>
                        )}
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default CheckRecord;