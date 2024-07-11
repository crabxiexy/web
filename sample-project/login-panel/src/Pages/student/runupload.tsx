import React, { useState } from 'react';
import { useHistory } from 'react-router';
import useIdStore from 'Pages/IdStore';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import { SubmitRunningMessage } from 'Plugins/RunAPI/SubmitRunningMessage';
import * as Minio from 'minio'; // 导入 MinIO 客户端库

const minioClient = new Minio.Client({
    endPoint: '183.172.236.220', // 替换为您的 MinIO 服务器地址
    port: 9004,
    useSSL: false,
    accessKey: '0z6MIh37MRHwNAHlD61L', // 替换为您的 MinIO Access Key
    secretKey: 'WTrjlAOluMvOhS9ztr9pXoOrrlk1U292tXx6RaLN', // 替换为您的 MinIO Secret Key
});

export const RunUpload: React.FC = () => {
    const history = useHistory();
    const { Id } = useIdStore();

    // States for tracking run data
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [finishTime, setFinishTime] = useState<Date | null>(null);
    const [distance, setDistance] = useState<string>('');
    const [clickCount, setClickCount] = useState<number>(0);
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [runId, setRunId] = useState<string>('');

    // State for uploaded image
    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleStartFinishRunning = () => {
        if (clickCount === 0) {
            setStartTime(new Date());
        } else if (clickCount === 1) {
            setFinishTime(new Date());
        }

        setClickCount(prevCount => prevCount + 1);
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

    const handleSubmit = async () => {
        if (startTime && finishTime && distance && uploadedImage) {
            const filename = uploadedImage.name;

            try {
                await minioClient.fPutObject('proof', filename, uploadedImage.path, {});

                const studentIdNumber = parseInt(Id);
                const distanceNumber = parseFloat(distance) * 10;
                const submitMessage = new SubmitRunningMessage(
                    studentIdNumber,
                    startTime.getTime().toString(),
                    finishTime.getTime().toString(),
                    distanceNumber,
                    `http://183.172.236.220:9005/proof/${filename}`
                );

                const response = await sendPostRequest(submitMessage);
                console.log('Submit Running Message Response:', response);
                setSubmitted(true);
                setError(null);
                // 提交成功后自动回到上一个页面
                history.goBack();
            } catch (error) {
                console.error('Error handling image upload and submission:', error);
                setError('处理上传和提交时出错，请稍后再试。');
            }
        }
    };

    const handleCancel = () => {
        setStartTime(null);
        setFinishTime(null);
        setDistance('');
        setUploadedImage(null);
        setUploadedImageUrl(null);
        setClickCount(0);
        setError(null);
        setSubmitted(false);
        history.push('/student_dashboard');
    };

    const handleDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDistance(e.target.value);
    };

    return (
        <div className="run-upload-page">
            <h1>Run Upload</h1>
            {error && <p className="error-message">{error}</p>}
            <div className="timestamp-box">
                <p>Start Time: {startTime ? startTime.toLocaleString() : '-'}</p>
                <p>Finish Time: {finishTime ? finishTime.toLocaleString() : '-'}</p>
            </div>
            <div className="distance-input">
                <label htmlFor="distance">Distance (in kilometers):</label>
                <input
                    type="number"
                    id="distance"
                    value={distance}
                    onChange={handleDistanceChange}
                    step="0.1"
                    min="0"
                    required
                />
            </div>
            <div className="image-upload">
                <label htmlFor="file-upload">Upload Image:</label>
                <input
                    type="file"
                    id="file-upload"
                    onChange={handleImageUpload}
                    accept="image/*"
                />
                {uploadedImageUrl && (
                    <img src={uploadedImageUrl} alt="Uploaded" style={{ maxWidth: '100%', maxHeight: '400px', marginTop: '10px' }} />
                )}
            </div>
            <div className="button-group">
                <button className="start-button" onClick={handleStartFinishRunning} disabled={clickCount >= 2}>
                    {clickCount === 0 ? 'Start Running' : 'Finish Running'}
                </button>
                <button className="submit-button" onClick={handleSubmit} disabled={!startTime || !finishTime || !distance || !uploadedImage || submitted}>
                    Submit
                </button>
                <button className="cancel-button" onClick={handleCancel}>
                    Cancel
                </button>
            </div>
            {submitted && <p className="submitted-message">Run data submitted successfully!</p>}
        </div>
    );
};

export default RunUpload;