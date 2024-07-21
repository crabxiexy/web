import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Modal from 'react-modal';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import { AssignTAMessage } from 'Plugins/StudentAPI/AssignTAMessage';
import { CheckTokenMessage } from 'Plugins/DoctorAPI/CheckTokenMessage';
import { GetStudentMessage } from 'Plugins/StudentAPI/GetStudentMessage';
import { TAQueryMessage } from 'Plugins/StudentAPI/TAQueryMessage';
import { AssignScoreMessage } from 'Plugins/StudentAPI/AssignScoreMessage';
import useIdStore from 'Plugins/IdStore';
import useTokenStore from 'Plugins/TokenStore';
import styles from './student_management.module.css';
import Sidebar from 'Pages/Sidebar';
import { Student, TA } from 'Plugins/types';

interface TAData extends Student {
    standardScore: number;
    editable: boolean;
}

export const AssignTA: React.FC = () => {
    const history = useHistory();
    const { Id } = useIdStore();
    const {Token} =useTokenStore();
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<Set<number>>(new Set());
    const [error, setError] = useState<string>('');
    const [username, setUsername] = useState<string>('Guest');
    const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
    const [taData, setTaData] = useState<TAData[]>([]);
    const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            setUsername(storedUsername);
        }
        fetchStudents();
        fetchTAData();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await sendPostRequest(new GetStudentMessage());
            setStudents(response.data);
        } catch {
            setError('加载学生信息失败。');
        }
    };

    const fetchTAData = async () => {
        try {
            const taIdNumber = parseInt(Id);
            const taQueryMessage = new TAQueryMessage(taIdNumber);
            const taResponse = await sendPostRequest(taQueryMessage);

            const taDataWithScores = taResponse.data.students.map((student: Student) => {
                const standardScore = student.score.run + student.score.groupex + student.score.activity;

                return {
                    ...student,
                    standardScore,
                    editable: false
                };
            });

            setTaData(taDataWithScores);
        } catch {
            setError('加载TA信息失败。');
        }
    };

    const handleSelectStudent = (studentId: number) => {
        setSelectedStudents(prev => {
            const updated = new Set(prev);
            if (updated.has(studentId)) {
                updated.delete(studentId);
            } else {
                updated.add(studentId);
            }
            return updated;
        });
    };

    const handleEditScore = (studentID: number) => {
        setTaData(prevData =>
            prevData.map(ta =>
                ta.studentID === studentID ? { ...ta, editable: true, totalScore: ta.standardScore } : ta
            )
        );
    };

    const handleScoreChange = (studentID: number, newScore: number) => {
        setTaData(prevData =>
            prevData.map(ta =>
                ta.studentID === studentID ? { ...ta, score: { ...ta.score, total: newScore } } : ta
            )
        );
    };

    const validateTokenAndSubmitScores = async () => {
        try {
            const taIdNumber = parseInt(Id);
            const checkTokenMessage = new CheckTokenMessage(taIdNumber, Token);
            const tokenResponse = await sendPostRequest(checkTokenMessage);

            if (tokenResponse.data === "Token is valid.") {
                await handleSubmitScores();
            } else {
                setError("Token无效或已过期。");
                history.push("/login");
            }
        } catch {
            setError('Token 验证失败，请重试。');
        }
    };

    const handleSubmitScores = async () => {
        try {
            for (const ta of taData) {
                if (ta.editable) {
                    const assignScoreMessage = new AssignScoreMessage(ta.studentID, ta.score.total);
                    await sendPostRequest(assignScoreMessage);
                }
            }

            setTaData(prevData =>
                prevData.map(item => ({ ...item, editable: false }))
            );

            setError('成绩已成功提交。');
            fetchTAData();
        } catch {
            setError('提交成绩失败，请重试。');
        }
    };

    const handleAssignTA = async () => {
        try {
            const taIdNumber = parseInt(Id);
            const checkTokenMessage = new CheckTokenMessage(taIdNumber, Token);
            const tokenResponse = await sendPostRequest(checkTokenMessage);

            if (tokenResponse.data === "Token is valid.") {
                for (const studentId of selectedStudents) {
                    const assignTAMessage = new AssignTAMessage(studentId, taIdNumber);
                    await sendPostRequest(assignTAMessage);
                }
                history.push('/ta_dashboard');
            } else {
                setError("Token无效或已过期。");
                history.push("/login");
            }
        } catch {
            setError('分配TA失败，请重试。');
        }
    };

    const toggleDropdown = () => setDropdownVisible(!dropdownVisible);

    const openModal = () => setModalIsOpen(true);
    const closeModal = () => {
        setModalIsOpen(false);
        setSelectedStudents(new Set());
    };

    return (
        <div className={styles.pageContainer}>
            <Sidebar />
            <header className={styles.header}>
                <h1 className={styles.title}>分配TA</h1>
                <div className={styles.userSection}>
                    <div className={styles.userAvatar} onClick={toggleDropdown}>{username}</div>
                    {dropdownVisible && (
                        <div className={styles.dropdownMenu}>
                            <p>个人资料</p>
                            <p>帮助</p>
                        </div>
                    )}
                </div>
            </header>
            <main className={styles.main}>
                {error && <p className={styles.errorMessage}>{error}</p>}
                <div className={styles.tableHeader}>
                    <h2>已分配至当前 TA 的学生</h2>
                    <button className={styles.button} onClick={validateTokenAndSubmitScores}>提交成绩</button>
                    <button className={styles.button} onClick={openModal}>增加学生</button>
                </div>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            <th>学生 ID</th>
                            <th>姓名</th>
                            <th>得分</th>
                            <th>系别</th>
                            <th>班级</th>
                            <th>跑步次数</th>
                            <th>团体锻炼次数</th>
                            <th>社团次数</th>
                            <th>总成绩</th>
                            <th>标准成绩</th>
                            <th>操作</th>
                        </tr>
                        </thead>
                        <tbody>
                        {taData.map((ta) => (
                            <tr key={ta.studentID}>
                                <td>{ta.studentID}</td>
                                <td>{ta.name}</td>
                                <td>{ta.score.total}</td>
                                <td>{ta.department}</td>
                                <td>{ta.className}</td>
                                <td>{ta.score.run}</td>
                                <td>{ta.score.groupex}</td>
                                <td>{ta.score.activity}</td>
                                <td>
                                    {ta.editable ? (
                                        <input
                                            type="number"
                                            value={ta.score.total}
                                            onChange={(e) => handleScoreChange(ta.studentID, Number(e.target.value))}
                                            className={styles.input}
                                        />
                                    ) : (
                                        ta.score.total
                                    )}
                                </td>
                                <td>{ta.standardScore}</td>
                                <td>
                                    {!ta.editable && (
                                        <button className={styles.button} onClick={() => handleEditScore(ta.studentID)}>编辑</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                <Modal
                    isOpen={modalIsOpen}
                    onRequestClose={closeModal}
                    contentLabel="选择学生"
                    className={styles.studentModal}
                    overlayClassName={styles.studentModalOverlay}
                >
                    <div className={styles.modalHeader}>
                        <h2>选择学生</h2>
                        <button className={styles.closeButton} onClick={closeModal}>&times;</button>
                    </div>
                    <div className={styles.studentsList}>
                        <table className={styles.table}>
                            <thead>
                            <tr>
                                <th>选择</th>
                                <th>ID</th>
                                <th>姓名</th>
                                <th>系别</th>
                                <th>班级</th>
                            </tr>
                            </thead>
                            <tbody>
                            {students.map((student) => (
                                <tr key={student.studentID}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedStudents.has(student.studentID)}
                                            onChange={() => handleSelectStudent(student.studentID)}
                                        />
                                    </td>
                                    <td>{student.studentID}</td>
                                    <td>{student.name}</td>
                                    <td>{student.department}</td>
                                    <td>{student.className}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                    <button className={styles.button} onClick={handleAssignTA}>
                        选为学生
                    </button>
                </Modal>
            </main>
        </div>
    );
};

export default AssignTA;
