import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import { FetchInfoMessage } from 'Plugins/ClubAPI/FetchInfoMessage';
import { UpdateIntroMessage } from 'Plugins/ClubAPI/UpdateIntroMessage';
import { UpdateProfileMessage } from 'Plugins/ClubAPI/UpdateProfileMessage';
import * as Minio from 'minio';
import useClubNameStore from 'Pages/student/ClubNameStore';
import Sidebar from 'Pages/Sidebar';
import updateclubinfo_style from './updateclubinfo.module.css';

const minioClient = new Minio.Client({
    endPoint: '183.172.236.220',
    port: 9004,
    useSSL: false,
    accessKey: '12345678',
    secretKey: '12345678',
});

export const UpdateClubInfo = () => {
    const history = useHistory();
    const { ClubName } = useClubNameStore();
    const [clubInfo, setClubInfo] = useState({ profile: '', intro: '' });
    const [newIntro, setNewIntro] = useState('');
    const [newProfile, setNewProfile] = useState<File | null>(null);
    const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [isEditingIntro, setIsEditingIntro] = useState(false);

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
            setIsEditingIntro(false);
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
                await minioClient.fPutObject('profile', filename, newProfile.path, {
                    'Content-Type': newProfile.type,
                });

                const updateProfileMessage = new UpdateProfileMessage(
                    ClubName,
                    profileImageUrl // Add the URL of the new profile image
                );

                await sendPostRequest(updateProfileMessage);
                alert('俱乐部头像更新成功！');
                history.goBack();
            } catch (error) {
                setError('更新失败，请重试。');
            }
        }
    };

    const handleBack = () => {
        history.goBack();
    };

    return (
        <div className={updateclubinfo_style.updateClubInfo}>
            <Sidebar />
            <div className={updateclubinfo_style.content}>
                <h2>更新俱乐部信息</h2>
                {error && <p className={updateclubinfo_style.errorMessage}>{error}</p>}

                <div className={updateclubinfo_style.clubInfo}>
                    <h3>当前头像</h3>
                    <div className={updateclubinfo_style.profileCircle}>
                        <img src={profileImageUrl} alt="Current Profile" className={updateclubinfo_style.clubProfile} />
                    </div>

                    <div className={updateclubinfo_style.buttonGroup}>
                        <label htmlFor="fileInput" className={updateclubinfo_style.fileInputLabel}>选择新头像</label>
                        <input id="fileInput" type="file" onChange={handleProfileChange} accept="image/*" className={updateclubinfo_style.fileInput} />
                        <button className={updateclubinfo_style.btn} onClick={handleUpdateProfile}>更新头像</button>
                    </div>
                </div>

                <div className={updateclubinfo_style.introContainer}>
                    <h3 className={updateclubinfo_style.introTitle}>当前介绍</h3>
                    {isEditingIntro ? (
                        <>
                            <textarea
                                value={newIntro}
                                onChange={(e) => setNewIntro(e.target.value)}
                                placeholder="输入新的俱乐部介绍"
                                required
                            />
                            <div className={updateclubinfo_style.editButtonGroup}>
                                <button className={updateclubinfo_style.btn} onClick={() => setIsEditingIntro(false)}>取消编辑</button>
                                <button className={updateclubinfo_style.btn} onClick={handleUpdateIntro}>更新介绍</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <p>{clubInfo.intro}</p>
                            <button className={updateclubinfo_style.editIntroButton}
                                    onClick={() => setIsEditingIntro(true)}>编辑介绍
                            </button>
                        </>
                    )}
                </div>

            </div>
        </div>
    );
};

export default UpdateClubInfo;