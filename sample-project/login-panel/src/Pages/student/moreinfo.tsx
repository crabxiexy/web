import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import useClubNameStore from 'Pages/student/ClubNameStore';
import { ShowActivityMessage } from 'Plugins/ActivityAPI/ShowActivityMessage';
import { FetchNameMessage } from 'Plugins/DoctorAPI/FetchNameMessage';
import { FetchProfileMessage } from 'Plugins/DoctorAPI/FetchProfileMessage';
import useIdStore from 'Pages/IdStore';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import { QueryMemberMessage } from 'Plugins/ActivityAPI/QueryMemberMessage';
import { SubmitHWMessage } from 'Plugins/ActivityAPI/SubmitHWMessage';
import * as Minio from 'minio';

const minioClient = new Minio.Client({
    endPoint: '183.173.185.144',
    port: 9004,
    useSSL: false,
    accessKey: '12345678',
    secretKey: '12345678',
});

interface Member {
    memberId: number;
    name: string;
    profile: string;
}

interface Activity {
    activityID: number;
    activityName: string;
    intro: string;
    starttime: string;
    finishtime: string;
    lowlimit: number;
    uplimit: number;
    members: Member[];
}

export const MoreInfo: React.FC = () => {
    const history = useHistory();
    const { ClubName } = useClubNameStore();
    const { Id } = useIdStore();
    const [activities, setActivities] = useState<Activity[]>([]);
    const [error, setError] = useState<string>('');
    const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
    const [membersDetails, setMembersDetails] = useState<Member[]>([]);
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

    const fetchMemberDetails = async (activityID: number) => {
        const memberResponse = await sendPostRequest(new QueryMemberMessage(activityID));
        const memberDetails = await Promise.all(
            memberResponse.data.map(async (memberObject: { memberID: number }) => {
                const memberId = memberObject.memberID;
                const [nameResponse, profileResponse] = await Promise.all([
                    sendPostRequest(new FetchNameMessage(memberId)),
                    sendPostRequest(new FetchProfileMessage(memberId)),
                ]);
                return {
                    memberId,
                    name: nameResponse.data,
                    profile: profileResponse.data,
                };
            })
        );
        setMembersDetails(memberDetails);
    };

    const handleBack = () => {
        history.goBack();
    };

    const handleOpenModal = async (activityID: number) => {
        setShowModal(true);
        setSelectedMembers([]);
        setCurrentActivityID(activityID);
        await fetchMemberDetails(activityID);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setUploadedImage(null);
        setUploadedImageUrl(null);
    };

    const handleMemberSelect = (memberId: number) => {
        setSelectedMembers((prevSelected) =>
            prevSelected.includes(memberId)
                ? prevSelected.filter((id) => id !== memberId)
                : [...prevSelected, memberId]
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
        const filename = uploadedImage.name;
        try {
            // Upload image to MinIO
            await minioClient.fPutObject('proof', filename, uploadedImage.path, {});
            for (const memberId of selectedMembers) {
                const submitMessage = new SubmitHWMessage(
                    parseInt(Id),
                    currentActivityID,
                    memberId,
                    `http://183.172.236.220:9004/proof/${filename}`
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
        <div className="more-info">
            <h1>所有活动</h1>
            {error && <p className="error-message">{error}</p>}
            {activities.length > 0 ? (
                activities.map((activity: Activity) => (
                    <div key={activity.activityID} className="activity-details">
                        <p><strong>活动名称:</strong> {activity.activityName}</p>
                        <p><strong>开始时间:</strong> {new Date(parseInt(activity.starttime)).toLocaleString()}</p>
                        <p><strong>结束时间:</strong> {new Date(parseInt(activity.finishtime)).toLocaleString()}</p>
                        <p><strong>人数限制:</strong> {activity.lowlimit} - {activity.uplimit}</p>

                        <button onClick={() => handleOpenModal(activity.activityID)}>提交作业</button>

                        {showModal && (
                            <div className="modal">
                                <div className="modal-content">
                                    <h2>提交作业</h2>
                                    <p>选择要提交作业的成员:</p>
                                    {membersDetails.map((member) => (
                                        <div key={member.memberId} className="member-item">
                                            <input
                                                type="checkbox"
                                                checked={selectedMembers.includes(member.memberId)}
                                                onChange={() => handleMemberSelect(member.memberId)}
                                            />
                                            <img src={member.profile} alt={member.name} className="member-profile" />
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
            <button className="back-button" onClick={handleBack}>
                返回
            </button>
        </div>
    );
};

export default MoreInfo;
