import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import useIdStore from 'Pages/IdStore';
import Sidebar from 'Pages/Sidebar';
import { AdminQueryAppMessage } from 'Plugins/ClubAPI/AdminQueryAppMessage';
import { ReplyAppMessage } from 'Plugins/ClubAPI/ReplyAppMessage';
import { QueryNameMessage } from 'Plugins/StudentAPI/QueryNameMessage';
import { QueryDepartmentMessage } from 'Plugins/StudentAPI/QueryDepartmentMessage';
import { FoundClubMessage } from 'Plugins/ClubAPI/FoundClubMessage';
import { GetDepartmentStudentMessage } from 'Plugins/StudentAPI/GetDepartmentStudentMessage';
import { ReleaseNotificationMessage } from 'Plugins/NotificationAPI/ReleaseNotificationMessage';

import styles from './root.module.css';

interface Application {
    name: string;
    leader: number;
    intro: string;
    department: string;
    is_checked: boolean;
}

interface StudentInfo {
    name: string;
    department: string;
}

export function Root() {
    const history = useHistory();
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const { setId } = useIdStore();
    const [applications, setApplications] = useState<Application[]>([]);
    const [studentInfos, setStudentInfos] = useState<Record<number, StudentInfo>>({});
    const [showModal, setShowModal] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
    const [response, setResponse] = useState('');
    const [result, setResult] = useState(0); // 0 for rejected, 1 for approved
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;

    const toggleDropdown = () => {
        setDropdownVisible(!dropdownVisible);
    };

    const handleLogout = () => {
        setId('');
        history.push("/");
    };

    const handleRename = () => {
        history.push("/rename");
    };

    const handleRegister = () => {
        history.push("/register");
    };

    const handleReturn = () => {
        setShowModal(false);
    };

    useEffect(() => {
        const fetchApplications = async () => {
            const queryMessage = new AdminQueryAppMessage(0); // Fetch unchecked applications
            try {
                const response = await sendPostRequest(queryMessage);
                setApplications(response.data);

                // Fetch student info for all applications
                const fetchedStudentInfos = await Promise.all(
                    response.data.map(async (application: Application) => {
                        const info = await fetchStudentInfo(application.leader);
                        return { leader: application.leader, info };
                    })
                );

                const studentInfoMap = fetchedStudentInfos.reduce((acc, { leader, info }) => {
                    acc[leader] = info;
                    return acc;
                }, {} as Record<number, StudentInfo>);

                setStudentInfos(studentInfoMap);
            } catch (error) {
                setError('加载俱乐部申请失败，请重试。');
            }
        };

        fetchApplications();
    }, []);

    const fetchStudentInfo = async (leaderId: number): Promise<StudentInfo> => {
        try {
            const nameMessage = new QueryNameMessage(leaderId);
            const nameResponse = await sendPostRequest(nameMessage);
            const departmentMessage = new QueryDepartmentMessage(leaderId);
            const departmentResponse = await sendPostRequest(departmentMessage);

            return { name: nameResponse.data, department: departmentResponse.data };
        } catch (error) {
            setError('加载学生信息失败，请重试。');
            return { name: '', department: '' }; // Return empty on error
        }
    };

    const handleReply = (application: Application) => {
        setSelectedApplication(application);
        setShowModal(true);
    };

    const handleSubmitReply = async () => {
        if (!selectedApplication) {
            setError('没有选择申请。');
            return;
        }

        if (!response) {
            setError('请填写回复。');
            return;
        }

        // Your existing logic for submitting reply goes here

    };

    // Calculate the number of pages based on the number of applications and items per page
    const totalPages = Math.ceil(applications.length / itemsPerPage);

    return (
        <div className={`${styles.App} ${styles['half-width']}`}>
            <header className={styles['App-header']}>
                <Sidebar></Sidebar>
                <div className={styles['user-section']}>
                    {dropdownVisible && (
                        <div className={styles['dropdown-menu']}>
                            <p onClick={handleRename}>重命名</p>
                        </div>
                    )}
                </div>
            </header>

            <main>
                <button className={styles.registerButton} onClick={handleRegister}>注册新用户</button>

                <section className={styles.applications}>
                    <h2>俱乐部申请审批</h2>
                    {error && <p className={styles['error-message']}>{error}</p>}
                    {applications.length > 0 ? (
                        applications
                            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                            .map((application) => (
                                <div key={`${application.name}-${application.leader}`}
                                     className={styles['application-item']}>
                                    <p><strong>俱乐部名称:</strong> {application.name}</p>
                                    <p><strong>申请人学号:</strong> {application.leader}</p>
                                    <p>
                                        <strong>申请人姓名:</strong> {studentInfos[application.leader]?.name || '加载中...'}
                                    </p>
                                    <p>
                                        <strong>院系:</strong> {studentInfos[application.leader]?.department || '加载中...'}
                                    </p>
                                    <p><strong>介绍:</strong> {application.intro}</p>
                                    <p><strong>部门:</strong> {application.department}</p>
                                    <button className={styles.btn} onClick={() => handleReply(application)}>回复</button>
                                </div>
                            ))
                    ) : (
                        <p>没有待审批的俱乐部申请。</p>
                    )}
                </section>

                {/* Add pagination controls if there are more than itemsPerPage applications */}
                {applications.length > itemsPerPage && (
                    <div className={styles.pagination}>
                        <button
                            className={`${styles.updownButton} ${currentPage === 1 ? styles.disabled : ''}`}
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            上一页
                        </button>
                        <p className={styles.pageInfo}>第 {currentPage} 页 / 共 {totalPages} 页</p>
                        <button
                            className={`${styles.updownButton} ${currentPage === totalPages ? styles.disabled : ''}`}
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            下一页
                        </button>
                    </div>
                )}

                {showModal && selectedApplication && (
                    <div className={styles.modal}>
                        <div className={styles['modal-content']}>
                            <span className={styles.close} onClick={() => setShowModal(false)}>&times;</span>
                            <h2>申请详情</h2>
                            <p><strong>俱乐部名称:</strong> {selectedApplication.name}</p>
                            <p><strong>申请人学号:</strong> {selectedApplication.leader}</p>
                            <p><strong>申请人姓名:</strong> {studentInfos[selectedApplication.leader]?.name}</p>
                            <p><strong>介绍:</strong> {selectedApplication.intro}</p>
                            <p><strong>部门:</strong> {selectedApplication.department}</p>

                            <h3>学生信息</h3>
                            <p><strong>姓名:</strong> {studentInfos[selectedApplication.leader]?.name}</p>
                            <p><strong>院系:</strong> {studentInfos[selectedApplication.leader]?.department}</p>

                            <h2>回复申请</h2>
                            <textarea
                                placeholder="回复"
                                value={response}
                                onChange={(e) => setResponse(e.target.value)}
                                required
                            />
                            <div>
                                <label>
                                    <input
                                        type="radio"
                                        value={1}
                                        checked={result === 1}
                                        onChange={() => setResult(1)}
                                    />
                                    通过
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        value={0}
                                        checked={result === 0}
                                        onChange={() => setResult(0)}
                                    />
                                    不通过
                                </label>
                            </div>
                            <button className={styles.btn} onClick={handleSubmitReply}>提交</button>
                            <button className={styles.btn} onClick={handleReturn}>返回</button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default Root;
