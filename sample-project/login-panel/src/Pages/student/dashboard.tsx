import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import './dashboard.css';
import useIdStore from 'Pages/IdStore';
import useTokenStore from 'Pages/TokenStore';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import { QueryReceivedMessage } from 'Plugins/NotificationAPI/QueryReceivedMessage';
import { CountRunMessage } from 'Plugins/RunAPI/CountRunMessage';
import { CountGroupexMessage } from 'Plugins/GroupExAPI/CountGroupexMessage';
import Sidebar from 'Pages/Sidebar';
import { CountHWMessage } from 'Plugins/ActivityAPI/CountHWMessage' // Import the Sidebar component

export function Dashboard() {
    const history = useHistory();
    const { Id, setId } = useIdStore();
    const { setToken } = useTokenStore();
    const [notifications, setNotifications] = useState<{ content: string; releaserName: string }[]>([]);
    const [runCount, setRunCount] = useState<number | null>(null);
    const [groupexCount, setGroupexCount] = useState<number | null>(null);
    const[clubCount, setClubCount] = useState<number | null>(null);
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

        const fetchCounts = async () => {
            const runMessage = new CountRunMessage(parseInt(Id));
            const groupexMessage = new CountGroupexMessage(parseInt(Id));

            try {
                const runResponse = await sendPostRequest(runMessage);
                setRunCount(runResponse.data);

                const groupexResponse = await sendPostRequest(groupexMessage);
                setGroupexCount(groupexResponse.data);
                const clubResponse=await sendPostRequest(new CountHWMessage(parseInt(Id)))
                setClubCount(clubResponse.data);
            } catch (error) {
                console.error('Error fetching counts:', error);
            }
        };

        fetchCounts();
        fetchNotifications();
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
        <div className="App">
            <div className="dashboard-container">
                <main>
                    <section className="notifications">
                        <h2>Notifications</h2>
                        <div className="notification-board">
                            {notifications.length === 0 ? (
                                <p>No notifications available.</p>
                            ) : (
                                notifications.map((notification, index) => (
                                    <div key={index} className="notification-item">
                                        <p><strong>{notification.releaserName}</strong>: {notification.content}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    <section className="counts">
                        <h2>Counts</h2>
                        <p>Run Count: {runCount !== null ? runCount : 'Loading...'}</p>
                        <p>Group Exercise Count: {groupexCount !== null ? groupexCount : 'Loading...'}</p>
                        <p>Club Count: {clubCount !== null ? clubCount : 'Loading...'}</p>
                    </section>

                    <div className="square-block" onClick={() => handleNavigation("/student_runupload")}>
                        阳光长跑登记
                    </div>
                    <div className="square-block" onClick={() => handleNavigation("/student_check")}>
                        锻炼记录查询
                    </div>
                    <div className="square-block" onClick={() => handleNavigation("/student_checkgroupex")}>
                        集体锻炼查询
                    </div>
                    <div className="square-block" onClick={() => handleNavigation("/ViewClub")}>
                        俱乐部活动查询
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Dashboard;
