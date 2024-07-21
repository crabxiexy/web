import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import student_dashboard_style from './student_dashboard.module.css';
import useIdStore from 'Plugins/IdStore';
import useTokenStore from 'Plugins/TokenStore';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import { QueryReceivedMessage } from 'Plugins/NotificationAPI/QueryReceivedMessage';
import { FetchStudentInfoMessage } from 'Plugins/StudentAPI/FetchStudentInfoMessage';
import Sidebar from 'Pages/Sidebar';

export function StudentDashboard() {
    const history = useHistory();
    const { Id, setId } = useIdStore();
    const { setToken } = useTokenStore();
    const [notifications, setNotifications] = useState([]);
    const [studentInfo, setStudentInfo] = useState(null);

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

        const fetchStudentInfo = async () => {
            const fetchStudentInfoMessage = new FetchStudentInfoMessage(parseInt(Id));
            try {
                const response = await sendPostRequest(fetchStudentInfoMessage);
                setStudentInfo(response.data);
            } catch (error) {
                console.error('Error fetching student info:', error);
            }
        };

        if (Id) {
            fetchNotifications();
            fetchStudentInfo();
        }
    }, [Id]);

    const handleLogout = () => {
        setId('');
        setToken('');
        history.push("/");
    };

    const handleNavigation = (path: string) => {
        history.push(path);
    };

    return (
        <div className={student_dashboard_style.App}>
            <Sidebar />
            <div>
                <section className={student_dashboard_style.notifications}>
                    <h2>通知</h2>
                    <div className={student_dashboard_style.notificationBoard}>
                        {notifications.length === 0 ? (
                            <p>目前没有通知。</p>
                        ) : (
                            notifications.map((notification, index) => (
                                <div key={index} className={student_dashboard_style.notificationItem}>
                                    <p><strong>{notification.sender.name}</strong>: {notification.content}</p>
                                </div>
                            ))
                        )}
                    </div>
                </section>
                {studentInfo && (
                    <section className={student_dashboard_style.counts}>
                        <div className={student_dashboard_style.countcard}>
                            <h3 className={student_dashboard_style.countcardtitle}>阳光长跑</h3>
                            <p className={student_dashboard_style.countcardvalue}>{studentInfo.score.run}</p>
                        </div>
                        <div className={student_dashboard_style.countcard}>
                            <h3 className={student_dashboard_style.countcardtitle}>集体锻炼</h3>
                            <p className={student_dashboard_style.countcardvalue}>{studentInfo.score.groupex}</p>
                        </div>
                        <div className={student_dashboard_style.countcard}>
                            <h3 className={student_dashboard_style.countcardtitle}>俱乐部活动</h3>
                            <p className={student_dashboard_style.countcardvalue}>{studentInfo.score.activity}</p>
                        </div>
                        <div className={student_dashboard_style.countcard}>
                            <h3 className={student_dashboard_style.countcardtitle}>总分</h3>
                            <p className={student_dashboard_style.countcardvalue}>{studentInfo.score.total}</p>
                        </div>
                    </section>
                )}

                <section className={student_dashboard_style.btn_group}>
                    <button className={student_dashboard_style.btn}
                            onClick={() => handleNavigation("/student_runupload")}>阳光长跑登记
                    </button>
                    <button className={student_dashboard_style.btn}
                            onClick={() => handleNavigation("/student_checkgroupex")}>集体锻炼查询
                    </button>
                    <button className={student_dashboard_style.btn}
                            onClick={() => handleNavigation("/ViewClub")}>俱乐部查询
                    </button>
                    <button className={student_dashboard_style.btn}
                            onClick={() => handleNavigation("/student_check")}>锻炼记录查询
                    </button>
                </section>
            </div>
        </div>
    );
}

export default StudentDashboard;