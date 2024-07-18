import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import useIdStore from 'Pages/IdStore';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import { FetchProfileMessage } from 'Plugins/DoctorAPI/FetchProfileMessage';
import { UpdateProfileMessage } from 'Plugins/DoctorAPI/UpdateProfileMessage';
import * as Minio from 'minio';
import updateprofilestyle from './UpdateProfile.module.css'; // Import CSS module

const minioClient = new Minio.Client({
    endPoint: '127.0.0.1',
    port: 5000,
    useSSL: false,
    accessKey: '12345678',
    secretKey: '12345678',
});

export const UpdateProfilePage: React.FC = () => {
    const history = useHistory();
    const { Id } = useIdStore();
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
    const [currentProfileImage, setCurrentProfileImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState<boolean>(false);

    useEffect(() => {
        const fetchProfile = async () => {
            const fetchProfileMessage = new FetchProfileMessage(parseInt(Id));
            try {
                const response = await sendPostRequest(fetchProfileMessage);
                setCurrentProfileImage(response.data);
            } catch (error) {
                console.error('Error fetching profile:', error);
                setError('未能查找到当前的用户头像');
            }
        };

        fetchProfile();
    }, [Id]);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            setProfileImage(file);

            const reader = new FileReader();
            reader.onload = () => {
                const imageUrl = reader.result as string;
                setProfileImageUrl(imageUrl);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        if (profileImage) {
            const filename = profileImage.name;

            try {
                await minioClient.fPutObject('profile', filename, profileImage.path, {});

                const updateProfileMessage = new UpdateProfileMessage(
                    parseInt(Id),
                    `http://127.0.0.1:5000/profile/${filename}`
                );

                const response = await sendPostRequest(updateProfileMessage);
                console.log('Update Profile Response:', response);
                setSubmitted(true);
                setError(null);
                history.goBack();
            } catch (error) {
                console.error('Error handling image upload and submission:', error);
                setError('Error processing upload and submission. Please try again later.');
            }
        }
    };

    const handleCancel = () => {
        setProfileImage(null);
        setProfileImageUrl(null);
        setError(null);
        setSubmitted(false);
        history.push('/student_dashboard');
    };

    const handleBack = () => {
        history.goBack();
    };

    return (
        <div className={updateprofilestyle.container}>
            <h1>更新头像</h1>
            {error && <p className={updateprofilestyle.error}>{error}</p>}
            <div className={updateprofilestyle.imageContainer}>
                <h2>当前用户头像:</h2>
                {currentProfileImage ? (
                    <img src={currentProfileImage} alt="Current Profile" className={updateprofilestyle.currentImage} />
                ) : (
                    <p>还未设置头像</p>
                )}
            </div>
            <div className={updateprofilestyle.uploadContainer}>
                <label htmlFor="file-upload">上传新头像</label>
                <input
                    type="file"
                    id="file-upload"
                    onChange={handleImageUpload}
                    accept="image/*"
                />
                {profileImageUrl && (
                    <img src={profileImageUrl} alt="Uploaded" className={updateprofilestyle.uploadedImage} />
                )}
            </div>
            <div className={updateprofilestyle.buttonContainer}>
                <button className={updateprofilestyle.submitButton} onClick={handleSubmit} disabled={!profileImage || submitted}>
                    提交新头像
                </button>
                <button className={updateprofilestyle.cancelButton} onClick={handleCancel}>
                    取消
                </button>
                <button className={updateprofilestyle.backButton} onClick={handleBack}>
                    返回上一页
                </button>
            </div>
            {submitted && <p className={updateprofilestyle.submittedMessage}>Profile updated successfully!</p>}
        </div>
    );
};

export default UpdateProfilePage;
