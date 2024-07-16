import React, { useState } from 'react';
import { useHistory } from 'react-router';
import useIdStore from 'Pages/IdStore';
import './dashboard.css'; // Ensure the correct path to your CSS file
import { ReleaseNotificationMessage } from 'Plugins/NotificationAPI/ReleaseNotificationMessage';
import { FetchNameMessage } from 'Plugins/DoctorAPI/FetchNameMessage';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils'

export function TA_dashboard() {
    const history = useHistory();
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [isModalOpen, setModalOpen] = useState(false);
    const [notificationContent, setNotificationContent] = useState('');
    const { setId } = useIdStore();
    const studentId = 1; // Replace with the actual student ID logic

    const toggleDropdown = () => {
        setDropdownVisible(!dropdownVisible);
    };

    const handleRename = () => {
        history.push("/rename");
    };

    const handleStudentManagement = () => {
        history.push("/ta_student_management");
    };

    const handleRunningCheck = () => {
        history.push("/ta_running_check");
    };

    const handleGroupexManagement = () => {
        history.push("/groupex_management");
    };

    const handleLogout = () => {
        setId('');
        history.push("/");
    };

    const openModal = () => {
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setNotificationContent('');
    };

    const handleNotificationSubmit = async () => {
        const releaserName = await fetchReleaserName(studentId);
        const senderId = parseInt(useIdStore().Id);
        const receiverId = 2; // Set the actual receiver ID as needed

        const notification = new ReleaseNotificationMessage(releaserName, senderId, receiverId, notificationContent);

        // Here you would typically send the notification object to your backend
        // Example: await sendNotificationToBackend(notification);

        closeModal();
    };

    const fetchReleaserName = async (studentId:number) => {
        // Create an instance of FetchNameMessage
        const fetchNameMessage = new FetchNameMessage(studentId);

        // Call the API or service to get the releaser name
        // This is a placeholder for your actual implementation
        try {
            // Assume fetchReleaserNameFromAPI is a function that makes the API call
            const response = await sendPostRequest(fetchNameMessage);
            return response.data; // Assuming the response has a 'name' property
        } catch (error) {
            console.error("Error fetching releaser name:", error);
            return "Unknown Releaser"; // Fallback if there is an error
        }
    };



    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
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
                <div className="square-block" onClick={handleStudentManagement}>
                    学生管理
                </div>
                <div className="square-block" onClick={handleRunningCheck}>
                    阳光长跑审批
                </div>
                <div className="square-block" onClick={handleGroupexManagement}>
                    集体锻炼管理
                </div>
                <button className="btn publish-btn" onClick={openModal}>
                    发布公告
                </button>

                {isModalOpen && (
                    <div className="modal">
                        <div className="modal-content">
                            <h2>发布公告</h2>
                            <textarea
                                value={notificationContent}
                                onChange={(e) => setNotificationContent(e.target.value)}
                                placeholder="输入公告内容"
                            />
                            <button className="btn" onClick={handleNotificationSubmit}>提交</button>
                            <button className="btn" onClick={closeModal}>关闭</button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default TA_dashboard;
