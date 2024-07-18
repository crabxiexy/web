import React, { useState, useEffect } from 'react';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils'; // 根据项目结构调整导入路径
import { StudentQueryRunningMessage } from 'Plugins/RunAPI/StudentQueryRunningMessage'; // 根据项目结构调整导入路径
import useIdStore from 'Pages/IdStore';
import { useHistory } from 'react-router';
import Modal from 'react-modal'; // 引入 react-modal 组件
import student_checkrecord_style from "./checkrecord.module.css"

Modal.setAppElement('#root');

// 定义每个跑步记录的接口
interface Run {
    runID: number;
    starttime: string;
    finishtime: string;
    submittime: string;
    distance: number;
    imgurl: string; // 图片 URL 字段
    isChecked: number; // 假设 is_checked 存储为数字 (0, 1, 2)
    response: string;
    certificate: string; // 假设每个记录有一个凭证字段
}

export const CheckRecord = ({ studentId }: { studentId: number }) => {
    const status: { [key: number]: string } = {
        0: '未审核',
        1: '已通过',
        2: '不通过',
    };

    const history = useHistory();
    const { Id } = useIdStore();
    const [error, setError] = useState<string>('');
    const [records, setRecords] = useState<Run[]>([]);
    const [modalIsOpen, setModalIsOpen] = useState<boolean>(false); // 控制弹窗显示状态
    const [selectedRecord, setSelectedRecord] = useState<Run | null>(null); // 保存选中的记录

    const handleCancel = () => {
        history.push('/student_dashboard');
    };

    // 解码时间戳为可读格式的函数
    const decodeTimestamp = (timestamp: string): string => {
        const date = new Date(parseInt(timestamp));
        return date.toLocaleString(); // 根据需要调整格式
    };

    // 处理点击显示凭证按钮
    const handleShowCertificate = (record: Run) => {
        setSelectedRecord(record);
        setModalIsOpen(true);
    };

    // 处理关闭弹窗
    const closeModal = () => {
        setModalIsOpen(false);
        setSelectedRecord(null);
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
        <div className={student_checkrecord_style.checkRecordContainer}>
            <h1>学生跑步记录</h1>
            {error && <p className={student_checkrecord_style.errorMessage}>{error}</p>}
            <div className={student_checkrecord_style.recordList}>
                {records.length > 0 ? (
                    <table className={student_checkrecord_style.table}>
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
                                <td>{record.distance} km</td>

                                <td>
                                    <button className={student_checkrecord_style.button} onClick={() => handleShowCertificate(record)}>
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
            <button className={student_checkrecord_style.cancelButton} onClick={handleCancel}>
                Cancel
            </button>

            {/* Modal for displaying certificate */}
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Certificate Modal"
                className="certificate-modal"
                overlayClassName="certificate-modal-overlay"
            >
                <div className="modal-header">
                    <button className="close-button" onClick={closeModal}>
                        &times;
                    </button>
                </div>
                <div className="modal-body">
                    <h2>凭证信息</h2>
                    {selectedRecord && (
                        <div>
                            <img src={selectedRecord.imgurl} alt="Certificate" style={{ maxWidth: '100%', maxHeight: '100%' }} />
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default CheckRecord;
