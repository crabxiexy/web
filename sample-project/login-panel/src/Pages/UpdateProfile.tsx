import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import useIdStore from 'Pages/IdStore';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import { FetchProfileMessage } from 'Plugins/DoctorAPI/FetchProfileMessage';
import { UpdateProfileMessage } from 'Plugins/DoctorAPI/UpdateProfileMessage';
import * as Minio from 'minio'; // Import MinIO client

const minioClient = new Minio.Client({
    endPoint: '183.172.236.220', // 替换为您的 MinIO 服务器地址
    port: 9004,
    useSSL: false,
    accessKey: '12345678', // 替换为您的 MinIO Access Key
    secretKey: '12345678', // 替换为您的 MinIO Secret Key
});

export const UploadProfilePage: React.FC = () => {
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
                setCurrentProfileImage(response.data); // Assuming the response contains the profileImage URL
            } catch (error) {
                console.error('Error fetching profile:', error);
                setError('Unable to fetch current profile image.');
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
                    `http://183.172.236.220:9004/profile/${filename}`
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
        history.goBack(); // Go back to the previous page
    };

    return (
        <div className="upload-profile-page">
            <h1>Upload Profile Image</h1>
            {error && <p className="error-message">{error}</p>}
            <div className="current-image">
                <h2>Current Profile Image:</h2>
                {currentProfileImage ? (
                    <img src={currentProfileImage} alt="Current Profile" style={{ maxWidth: '100%', maxHeight: '400px' }} />
                ) : (
                    <p>No profile image available.</p>
                )}
            </div>
            <div className="image-upload">
                <label htmlFor="file-upload">Upload New Image:</label>
                <input
                    type="file"
                    id="file-upload"
                    onChange={handleImageUpload}
                    accept="image/*"
                />
                {profileImageUrl && (
                    <img src={profileImageUrl} alt="Uploaded" style={{ maxWidth: '100%', maxHeight: '400px', marginTop: '10px' }} />
                )}
            </div>
            <div className="button-group">
                <button className="submit-button" onClick={handleSubmit} disabled={!profileImage || submitted}>
                    Submit
                </button>
                <button className="cancel-button" onClick={handleCancel}>
                    Cancel
                </button>
                <button className="back-button" onClick={handleBack}>
                    Back
                </button>
            </div>
            {submitted && <p className="submitted-message">Profile image submitted successfully!</p>}
        </div>
    );
};

export default UploadProfilePage;