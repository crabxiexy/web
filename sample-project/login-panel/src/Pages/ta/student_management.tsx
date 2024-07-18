import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Modal from 'react-modal';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import { AssignTAMessage } from 'Plugins/StudentAPI/AssignTAMessage';
import { CheckTokenMessage } from 'Plugins/DoctorAPI/CheckTokenMessage';
import { GetStudentMessage } from 'Plugins/StudentAPI/GetStudentMessage';
import { FetchNameMessage } from 'Plugins/DoctorAPI/FetchNameMessage';
import { TAQueryMessage } from 'Plugins/StudentAPI/TAQueryMessage';
import { CountRunMessage } from 'Plugins/RunAPI/CountRunMessage';
import { CountGroupexMessage } from 'Plugins/GroupExAPI/CountGroupexMessage';
import { CountHWMessage } from 'Plugins/ActivityAPI/CountHWMessage';
import { AssignScoreMessage } from 'Plugins/StudentAPI/AssignScoreMessage';
import useIdStore from 'Pages/IdStore';
import useTokenStore from 'Pages/TokenStore';
import styles from './student_management.module.css'; // Import the CSS module

interface Student {
    studentID: number;
    department: string;
    class: string;
    name?: string;
}

interface TAData {
    studentID: number;
    name?: string;
    score: number;
    department: string;
    class: string;
    countRun: number;
    countGroupex: number;
    countClub: number;
    totalScore: number;
    standardScore: number; // Add standardScore to the interface
    editable: boolean;
}

export const AssignTA: React.FC = () => {
    const history = useHistory();
    const { Id } = useIdStore();
    const token = useTokenStore(state => state.Token);
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
            const studentsData: Student[] = await Promise.all(
                response.data.map(async (student: Student) => {
                    try {
                        const nameResponse = await sendPostRequest(new FetchNameMessage(student.studentID));
                        return {
                            ...student,
                            name: nameResponse.data
                        };
                    } catch {
                        return {
                            ...student,
                            name: undefined
                        };
                    }
                })
            );
            setStudents(studentsData);
        } catch {
            setError('加载学生信息失败。');
        }
    };

    const fetchTAData = async () => {
        try {
            const taIdNumber = parseInt(Id);
            const taQueryMessage = new TAQueryMessage(taIdNumber);
            const taResponse = await sendPostRequest(taQueryMessage);

            const taDataWithCounts = await Promise.all(
                taResponse.data.map(async (ta: any) => {
                    try {
                        const nameResponse = await sendPostRequest(new FetchNameMessage(ta.studentID));
                        const countRunResponse = await sendPostRequest(new CountRunMessage(ta.studentID));
                        const countGroupexResponse = await sendPostRequest(new CountGroupexMessage(ta.studentID));
                        const countClubResponse = await sendPostRequest(new CountHWMessage(ta.studentID));

                        const standardScore = countClubResponse.data + countRunResponse.data + countGroupexResponse.data;

                        return {
                            ...ta,
                            name: nameResponse.data,
                            countRun: countRunResponse.data,
                            countGroupex: countGroupexResponse.data,
                            countClub: countClubResponse.data,
                            totalScore: ta.score, // Fetching score from the response
                            standardScore, // Store the standard score
                            editable: false // Initially set editable to false
                        };
                    } catch {
                        return {
                            ...ta,
                            name: undefined,
                            countRun: 0,
                            countGroupex: 0,
                            countClub: 0,
                            totalScore: 0,
                            standardScore: 0,
                            editable: false // Initially set editable to false
                        };
                    }
                })
            );

            setTaData(taDataWithCounts);
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
                ta.studentID === studentID ? { ...ta, editable: true, totalScore: ta.standardScore } : ta // Set totalScore to standardScore on edit
            )
        );
    };

    const handleScoreChange = (studentID: number, newScore: number) => {
        setTaData(prevData =>
            prevData.map(ta =>
                ta.studentID === studentID ? { ...ta, totalScore: newScore } : ta
            )
        );
    };

    const handleSubmitScores = async () => {
        try {
            for (const ta of taData) {
                if (ta.editable) {
                    const assignScoreMessage = new AssignScoreMessage(ta.studentID, ta.totalScore);
                    await sendPostRequest(assignScoreMessage);
                }
            }

            // Disable editing after submission
            setTaData(prevData =>
                prevData.map(item => ({ ...item, editable: false }))
            );

            setError('成绩已成功提交。');
            fetchTAData(); // Optionally refetch TA data to reflect changes
        } catch {
            setError('提交成绩失败，请重试。');
        }
    };

    const handleAssignTA = async () => {
        try {
            const taIdNumber = parseInt(Id);
            const checkTokenMessage = new CheckTokenMessage(taIdNumber, token);
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
    const goBack = () => history.goBack();

    const openModal = () => setModalIsOpen(true);
    const closeModal = () => {
        setModalIsOpen(false);
        setSelectedStudents(new Set()); // 关闭时清空选中的学生
    };

    return (
        <div className={styles.pageContainer}>
            <header className={styles.header}>
                <h1>分配TA</h1>
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
                <div className={styles.formContainer}>
                    <button className={styles.button} onClick={goBack}>返回</button>
                    <button className={styles.button} onClick={openModal}>增加学生</button>
                    <button className={styles.button} onClick={handleSubmitScores}>提交成绩</button>
                </div>
                <div className={styles.taData}>
                    <h2>已分配TA</h2>
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            <th>学生ID</th>
                            <th>姓名</th>
                            <th>得分</th>
                            <th>系</th>
                            <th>班级</th>
                            <th>跑步次数</th>
                            <th>团体锻炼次数</th>
                            <th>社团次数</th>
                            <th>总成绩</th>
                            <th>标准成绩</th> {/* Add Standard Score header */}
                            <th>操作</th>
                        </tr>
                        </thead>
                        <tbody>
                        {taData.map((ta) => (
                            <tr key={ta.studentID}>
                                <td>{ta.studentID}</td>
                                <td>{ta.name}</td>
                                <td>{ta.score}</td>
                                <td>{ta.department}</td>
                                <td>{ta.class}</td>
                                <td>{ta.countRun}</td>
                                <td>{ta.countGroupex}</td>
                                <td>{ta.countClub}</td>
                                <td>
                                    {ta.editable ? (
                                        <input
                                            type="number"
                                            value={ta.totalScore}
                                            onChange={(e) => handleScoreChange(ta.studentID, Number(e.target.value))}
                                            className={styles.input}
                                        />
                                    ) : (
                                        ta.totalScore
                                    )}
                                </td>
                                <td>{ta.standardScore}</td> {/* Display Standard Score */}
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
            </main>

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
                            {students.some(student => student.name) && <th>姓名</th>}
                            <th>系</th>
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
                                {student.name && <td>{student.name}</td>}
                                <td>{student.department}</td>
                                <td>{student.class}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                <button className={styles.button} onClick={handleAssignTA}>
                    分配选中的TA
                </button>
            </Modal>
        </div>
    );
};

export default AssignTA;
