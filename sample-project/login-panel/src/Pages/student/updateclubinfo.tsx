import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import { FetchInfoMessage } from 'Plugins/ClubAPI/FetchInfoMessage';
import { UpdateIntroMessage } from 'Plugins/ClubAPI/UpdateIntroMessage';
import { UpdateProfileMessage } from 'Plugins/ClubAPI/UpdateProfileMessage';
import * as Minio from 'minio';
import useClubNameStore from 'Pages/student/ClubNameStore';

const minioClient = new Minio.Client({
    endPoint: '183.172.236.220',
    port: 9004,
    useSSL: false,
    accessKey: '12345678',
    secretKey: '12345678',
});

export const UpdateClubInfo = () => {
    const history = useHistory();
    const { ClubName } = useClubNameStore(); // 从store中获取clubName
    const [clubInfo, setClubInfo] = useState({
        profile: '',
        intro: '',
    });
    const [newIntro, setNewIntro] = useState('');
    const [newProfile, setNewProfile] = useState<File | null>(null);
    const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchClubInfo = async () => {
            const message = new FetchInfoMessage(ClubName);
            try {
                const response = await sendPostRequest(message);
                setClubInfo({
                    profile: response.data.profile,
                    intro: response.data.intro,
                });
                setNewIntro(response.data.intro);
                setProfileImageUrl(response.data.profile);
            } catch (error) {
                setError('加载俱乐部信息失败，请重试。');
            }
        };

        fetchClubInfo();
    }, [ClubName]);

    const handleUpdateIntro = async () => {
        const updateMessage = new UpdateIntroMessage(ClubName, newIntro);
        try {
            await sendPostRequest(updateMessage);
            alert('俱乐部介绍更新成功！');
            history.goBack();
        } catch (error) {
            setError('更新失败，请重试。');
        }
    };

    const handleProfileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            setNewProfile(file);
            const reader = new FileReader();
            reader.onload = () => {
                const imageUrl = reader.result as string;
                setProfileImageUrl(imageUrl);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdateProfile = async () => {
        if (newProfile) {
            const filename = newProfile.name;
            try {
                // 上传文件到 MinIO
                await minioClient.fPutObject('profile', filename, newProfile.path, {
                    'Content-Type': newProfile.type,
                });

                // 使用 UpdateProfileMessage 更新头像信息
                const updateProfileMessage = new UpdateProfileMessage(ClubName,
                    `http://183.172.236.220:9004/profile/${filename}`
                );

                await sendPostRequest(updateProfileMessage);
                alert('俱乐部头像更新成功！');
                history.goBack();
            } catch (error) {
                setError('更新失败，请重试。');
            }
        }
    };

    return (
        <div className="update-club-info">
            <h2>更新俱乐部信息</h2>
            {error && <p className="error-message">{error}</p>}
            <div className="club-info">
                <h3>当前头像</h3>
                <img src={clubInfo.profile} alt="Current Profile" className="club-profile" />
                <h3>当前介绍</h3>
                <p>{clubInfo.intro}</p>
            </div>
            <div className="update-form">
                <h3>更新介绍</h3>
                <textarea
                    value={newIntro}
                    onChange={(e) => setNewIntro(e.target.value)}
                    placeholder="输入新的俱乐部介绍"
                    required
                />
                <button onClick={handleUpdateIntro}>更新介绍</button>

                <h3>更新头像</h3>
                <input type="file" onChange={handleProfileChange} accept="image/*" />
                <button onClick={handleUpdateProfile}>更新头像</button>
            </div>
        </div>
    );
};

export default UpdateClubInfo;
