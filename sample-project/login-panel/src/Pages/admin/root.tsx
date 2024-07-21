import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import useIdStore from 'Plugins/IdStore';
import useTokenStore from 'Plugins/TokenStore'
import Sidebar from 'Pages/Sidebar';
import { AdminQueryAppMessage } from 'Plugins/ClubAPI/AdminQueryAppMessage';
import { ReplyAppMessage } from 'Plugins/ClubAPI/ReplyAppMessage';
import { FoundClubMessage } from 'Plugins/ClubAPI/FoundClubMessage';
import { GetDepartmentStudentMessage } from 'Plugins/StudentAPI/GetDepartmentStudentMessage';
import { ReleaseNotificationMessage } from 'Plugins/NotificationAPI/ReleaseNotificationMessage';
import root_styles from './root.module.css';
import { ClubApplication } from 'Plugins/types'; // Import new type definition
import { validateToken } from 'Plugins/ValidateToken';


export function Root() {
    const history = useHistory();
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const { Id,setId } = useIdStore();
    const [applications, setApplications] = useState<ClubApplication[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState<ClubApplication | null>(null);
    const [response, setResponse] = useState('');
    const [result, setResult] = useState(0); // 0 for rejected, 1 for approved
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;
    const {Token} = useTokenStore();
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

    useEffect(() => {
        const fetchApplications = async () => {
            const queryMessage = new AdminQueryAppMessage(0); // Fetch unchecked applications
            try {
                const response = await sendPostRequest(queryMessage);
                setApplications(response.data);
            } catch (error) {
                setError('加载俱乐部申请失败，请重试。');
            }
        };

        fetchApplications();
    }, []);

    const handleReply = (application: ClubApplication) => {
        setSelectedApplication(application);
        setShowModal(true);
    };

    const handleSubmitReply = async () => {
        const tokenIsValid = await validateToken(Id,Token);
        if (!tokenIsValid) {
            setError('Token is invalid. Please log in again.');
            return;
        }

        if (!selectedApplication) {
            setError('没有选择申请。');
            return;
        }

        if (!response) {
            setError('请填写回复。');
            return;
        }

        const replyMessage = new ReplyAppMessage(selectedApplication.name, result, response);
        try {
            const replyResponse = await sendPostRequest(replyMessage);
            if (replyResponse.status === 200 && result === 1) {
                alert('回复成功！');

                // Trigger FoundClubMessage
                const foundClubMessage = new FoundClubMessage(
                    selectedApplication.name,
                    selectedApplication.leader.studentID,
                    selectedApplication.intro,
                    selectedApplication.department,
                    ''
                );
                await sendPostRequest(foundClubMessage);

                // Fetch department students and send notifications
                const departmentStudentsResponse = await sendPostRequest(new GetDepartmentStudentMessage(selectedApplication.department));
                const departmentStudents = departmentStudentsResponse.data;
                for (const student of departmentStudents) {
                    const notificationMessage = new ReleaseNotificationMessage(
                        selectedApplication.leader.studentID,
                        student.studentID,
                        `俱乐部 ${selectedApplication.name} 已经成立，欢迎加入！`
                    );
                    await sendPostRequest(notificationMessage);
                }

                setShowModal(false);
                setResponse('');
                setResult(0);

                // Refresh applications
                const queryMessage = new AdminQueryAppMessage(0);
                const applicationResponse = await sendPostRequest(queryMessage);
                setApplications(applicationResponse.data);
            }
        } catch (error) {
            setError('回复失败，请重试。');
        }
    };

    // Calculate the number of pages based on the number of applications and items per page
    const totalPages = Math.ceil(applications.length / itemsPerPage);

    return (
        <div className={root_styles.App}>
            <header className={root_styles['App-header']}>
                <Sidebar />
                <div className={root_styles['user-section']}>
                    {dropdownVisible && (
                        <div className={root_styles['dropdown-menu']}>
                            <p onClick={handleRename}>重命名</p>
                        </div>
                    )}
                </div>
            </header>

            <main>
                <button className={root_styles.registerButton} onClick={handleRegister}>注册新用户</button>

                <section className={root_styles.applications}>
                    <h2>俱乐部申请审批</h2>
                    {error && <p className={root_styles['error-message']}>{error}</p>}
                    {applications.length > 0 ? (
                        applications
                            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                            .map((application) => (
                                <div key={`${application.name}-${application.leader.studentID}`} className={root_styles['application-item']}>
                                    <p><strong>俱乐部名称:</strong> {application.name}</p>
                                    <p><strong>申请人学号:</strong> {application.leader.studentID}</p>
                                    <p>
                                        <strong>申请人姓名:</strong> {application.leader.name}
                                    </p>
                                    <p>
                                        <strong>院系:</strong> {application.leader.department}
                                    </p>
                                    <p><strong>介绍:</strong> {application.intro}</p>
                                    <p><strong>部门:</strong> {application.department}</p>
                                    <button className={root_styles.btn} onClick={() => handleReply(application)}>回复</button>
                                </div>
                            ))
                    ) : (
                        <p>没有待审批的俱乐部申请。</p>
                    )}
                </section>

                {applications.length > itemsPerPage && (
                    <div className={root_styles.pagination}>
                        <button
                            className={`${root_styles.updownButton} ${currentPage === 1 ? root_styles.disabled : ''}`}
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            上一页
                        </button>
                        <p className={root_styles.pageInfo}>第 {currentPage} 页 / 共 {totalPages} 页</p>
                        <button
                            className={`${root_styles.updownButton} ${currentPage === totalPages ? root_styles.disabled : ''}`}
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            下一页
                        </button>
                    </div>
                )}

                {showModal && selectedApplication && (
                    <div className={root_styles.modal}>
                        <div className={root_styles['modal-content']}>
                            <span className={root_styles.close} onClick={() => setShowModal(false)}>&times;</span>
                            <h2>申请详情</h2>
                            <p><strong>俱乐部名称:</strong> {selectedApplication.name}</p>
                            <p><strong>申请人学号:</strong> {selectedApplication.leader.studentID}</p>
                            <p><strong>申请人姓名:</strong> {selectedApplication.leader.name}</p>
                            <p><strong>介绍:</strong> {selectedApplication.intro}</p>
                            <p><strong>部门:</strong> {selectedApplication.department}</p>

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
                            <button className={root_styles.btn} onClick={handleSubmitReply}>提交</button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default Root;
