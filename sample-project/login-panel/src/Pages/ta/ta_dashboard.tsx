import React, {useEffect, useState} from 'react';
import { useHistory } from 'react-router';
import useIdStore from 'Pages/IdStore';
import ta_dashboard_style from './ta_dashboard.module.css'; // Ensure the correct path to your CSS file
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils'
import Sidebar from 'Pages/Sidebar';
import {QueryReceivedMessage} from "Plugins/NotificationAPI/QueryReceivedMessage";


export function TADashboard() {
    const history = useHistory();
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [isModalOpen, setModalOpen] = useState(false);
    const [notificationContent, setNotificationContent] = useState('');
    const { Id, setId } = useIdStore();
    const [notifications, setNotifications] = useState<{ content: string; releaserName: string }[]>([]);

    useEffect(() => {
        const fetchNotifications = async () => {
            const fetchNotificationsMessage = new QueryReceivedMessage(parseInt(Id));
            try {
                const response = await sendPostRequest(fetchNotificationsMessage);
                setNotifications(response.data);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        if (Id) {
            fetchNotifications();
        }
    }, [Id]);

    const handleStudentManagement = () => {
        history.push("/ta_student_management");
    };

    const handleRunningCheck = () => {
        history.push("/ta_running_check");
    };

    const handleGroupexManagement = () => {
        history.push("/groupex_management");
    };

    const handleHWManagement = () => {
        history.push("/HW_check");
    };

    return (
        <div className={ta_dashboard_style.App}>
            <Sidebar />

            <div>
                <section className={ta_dashboard_style.notifications}>
                    <h2>通知</h2>
                    <div className={ta_dashboard_style.notificationBoard}>
                        {notifications.length === 0 ? (
                            <p>目前没有通知。</p>
                        ) : (
                            notifications.map((notification, index) => (
                                <div key={index} className={ta_dashboard_style.notificationItem}>
                                    <p><strong>{notification.releaserName}</strong>: {notification.content}</p>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                <section className={ta_dashboard_style.btn_group}>
                    <button className={ta_dashboard_style.btn} onClick={handleStudentManagement}>
                        学生管理
                    </button>
                    <button className={ta_dashboard_style.btn} onClick={handleRunningCheck}>
                        阳光长跑审批
                    </button>
                    <button className={ta_dashboard_style.btn} onClick={handleGroupexManagement}>
                        集体锻炼管理
                    </button>
                    <button className={ta_dashboard_style.btn} onClick={handleHWManagement}>
                        俱乐部作业管理
                    </button>
                </section>
            </div>
        </div>
);
}

export default TADashboard;