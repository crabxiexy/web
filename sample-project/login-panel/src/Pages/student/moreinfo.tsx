import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import useClubNameStore from 'Pages/student/ClubNameStore';
import { ShowActivityMessage } from 'Plugins/ActivityAPI/ShowActivityMessage';
import useIdStore from 'Pages/IdStore';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import { SubmitHWMessage } from 'Plugins/ActivityAPI/SubmitHWMessage';
import * as Minio from 'minio';
import Sidebar from 'Pages/Sidebar';
import moreinfo_styles from './moreinfo_style.module.css'; // Import the CSS module
import { Activity, Student } from 'Pages/types'; // Import interfaces from types.ts

const minioClient = new Minio.Client({
    endPoint: '127.0.0.1',
    port: 5000,
    useSSL: false,
    accessKey: '12345678',
    secretKey: '12345678',
});

export const MoreInfo: React.FC = () => {
    const history = useHistory();
    const { ClubName } = useClubNameStore();
    const { Id } = useIdStore();
    const [activities, setActivities] = useState<Activity[]>([]);
    const [error, setError] = useState<string>('');
    const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [currentActivityID, setCurrentActivityID] = useState<number | null>(null);
    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

    useEffect(() => {
        fetchActivities();
    }, [ClubName]);

    const fetchActivities = async () => {
        try {
            const activitiesResponse = await sendPostRequest(new ShowActivityMessage(ClubName));
            setActivities(activitiesResponse.data);
        } catch (error) {
            setError('加载活动信息失败，请重试。');
        }
    };

    const handleBack = () => {
        history.goBack();
    };

    const handleOpenModal = async (activityID: number) => {
        setShowModal(true);
        setSelectedMembers([]);
        setCurrentActivityID(activityID);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setUploadedImage(null);
        setUploadedImageUrl(null);
    };

    const handleMemberSelect = (studentID: number) => {
        setSelectedMembers((prevSelected) =>
            prevSelected.includes(studentID)
                ? prevSelected.filter((id) => id !== studentID)
                : [...prevSelected, studentID]
        );
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            setUploadedImage(file);

            const reader = new FileReader();
            reader.onload = () => {
                const imageUrl = reader.result as string;
                setUploadedImageUrl(imageUrl);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmitHomework = async () => {
        if (!uploadedImage) {
            setError('请选择要上传的图片文件。');
            return;
        }

        const filename = uploadedImage.name;
        try {
            // Upload image to MinIO
            await minioClient.fPutObject('proof', filename, uploadedImage.path, {});

            for (const studentID of selectedMembers) {
                const submitMessage = new SubmitHWMessage(
                    parseInt(Id),
                    currentActivityID,
                    studentID,
                    filename // Add filename to the message
                );

                await sendPostRequest(submitMessage);
            }

            alert('作业提交成功！');
            handleCloseModal();
        } catch (error) {
            setError('提交作业失败，请重试。');
        }
    };

    return (
        <div className={moreinfo_styles.pageContainer}>
            <Sidebar />
            <div className={moreinfo_styles.moreInfoPage}>
                <h1>所有活动</h1>
                {error && <p className={moreinfo_styles.errorMessage}>{error}</p>}
                {activities.length > 0 ? (
                    activities.map((activity: Activity) => (
                        <div key={activity.activityID} className={moreinfo_styles.activityDetails}>
                            <p><strong>活动名称: </strong> {activity.activityName}</p>
                            <p><strong>开始时间: </strong> {new Date(activity.startTime).toLocaleString()}</p>
                            <p><strong>结束时间: </strong> {new Date(activity.finishTime).toLocaleString()}</p>
                            <p><strong>人数限制: </strong> {activity.lowLimit} - {activity.upLimit}</p>

                            <button onClick={() => handleOpenModal(activity.activityID)}>提交作业</button>

                            {showModal && currentActivityID === activity.activityID && (
                                <div className={moreinfo_styles.modal}>
                                    <div className={moreinfo_styles.modalContent}>
                                        <h2>提交作业</h2>
                                        <p>选择要提交作业的成员:</p>
                                        {activity.members.map((member: Student) => (
                                            <div key={member.studentID} className={moreinfo_styles.memberItem}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedMembers.includes(member.studentID)}
                                                    onChange={() => handleMemberSelect(member.studentID)}
                                                />
                                                <img src={member.profile} alt={member.name} className={moreinfo_styles.memberProfile} />
                                                <span>{member.name}</span>
                                            </div>
                                        ))}
                                        <input
                                            type="file"
                                            onChange={handleImageUpload}
                                            accept="image/*"
                                        />
                                        {uploadedImageUrl && (
                                            <img src={uploadedImageUrl} alt="Uploaded" style={{ maxWidth: '100%', maxHeight: '400px', marginTop: '10px' }} />
                                        )}
                                        <button onClick={handleSubmitHomework}>提交作业</button>
                                        <button onClick={handleCloseModal}>关闭</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p>没有活动信息可显示。</p>
                )}
                <button className={moreinfo_styles.backButton} onClick={handleBack}>
                    返回
                </button>
            </div>
        </div>
    );
};

export default MoreInfo;