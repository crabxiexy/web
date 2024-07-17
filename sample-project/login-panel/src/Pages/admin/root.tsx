import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import useIdStore from 'Pages/IdStore';
import { AdminQueryAppMessage } from 'Plugins/ClubAPI/AdminQueryAppMessage';
import { ReplyAppMessage } from 'Plugins/ClubAPI/ReplyAppMessage';
import { QueryNameMessage } from 'Plugins/StudentAPI/QueryNameMessage';
import { QueryDepartmentMessage } from 'Plugins/StudentAPI/QueryDepartmentMessage';
import { FoundClubMessage } from 'Plugins/ClubAPI/FoundClubMessage';
import 'Pages/Main.css';

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

        const replyMessage = new ReplyAppMessage(selectedApplication.name, result, response);
        try {
            const replyResponse = await sendPostRequest(replyMessage);
            if (replyResponse.status === 200 && result === 1) {
                alert('回复成功！');

                // Trigger FoundClubMessage
                const foundClubMessage = new FoundClubMessage(
                    selectedApplication.name,
                    selectedApplication.leader,
                    selectedApplication.intro,
                    selectedApplication.department,
                    "http://183.172.236.220:9005/proof/test.jpg"
                );
                await sendPostRequest(foundClubMessage);

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

    return (
        <div className="App">
            <header className="App-header">
                <h1>Physical Exercise System</h1>
                <div className="user-section">
                    <button className="btn login-btn" onClick={handleLogout}>Logout</button>
                    <div className="user-avatar" onClick={toggleDropdown}>👤</div>
                    {dropdownVisible && (
                        <div className="dropdown-menu">
                            <p onClick={handleRename}>Rename</p>
                        </div>
                    )}
                </div>
            </header>

            <main>
                <section className="applications">
                    <h2>俱乐部申请审批</h2>
                    {error && <p className="error-message">{error}</p>}
                    <div className="application-list">
                        {applications.length > 0 ? (
                            applications.map((application) => (
                                <div key={`${application.name}-${application.leader}`} className="application-item">
                                    <p><strong>俱乐部名称:</strong> {application.name}</p>
                                    <p><strong>申请人学号:</strong> {application.leader}</p>
                                    <p><strong>申请人姓名:</strong> {studentInfos[application.leader]?.name || '加载中...'}</p>
                                    <p><strong>院系:</strong> {studentInfos[application.leader]?.department || '加载中...'}</p>
                                    <p><strong>介绍:</strong> {application.intro}</p>
                                    <p><strong>部门:</strong> {application.department}</p>
                                    <button onClick={() => handleReply(application)}>回复</button>
                                </div>
                            ))
                        ) : (
                            <p>没有待审批的俱乐部申请。</p>
                        )}
                    </div>
                </section>

                <button className="btn register-btn" onClick={handleRegister}>注册</button>

                {showModal && selectedApplication && (
                    <div className="modal">
                        <div className="modal-content">
                            <span className="close" onClick={() => setShowModal(false)}>&times;</span>
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
                            <button onClick={handleSubmitReply}>提交</button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default Root;
