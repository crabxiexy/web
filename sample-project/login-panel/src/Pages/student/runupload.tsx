import React, { useState } from 'react';
import { useHistory } from 'react-router';
import useIdStore from 'Pages/IdStore';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import { SubmitRunningMessage } from 'Plugins/RunAPI/SubmitRunningMessage';
import { ReleaseNotificationMessage } from 'Plugins/NotificationAPI/ReleaseNotificationMessage';
import { FetchNameMessage } from 'Plugins/DoctorAPI/FetchNameMessage';
import { GetTAMessage } from 'Plugins/StudentAPI/GetTAMessage'; // Import your getTA message
import * as Minio from 'minio';
import runupload_styles from './runupload.module.css';
import Sidebar from 'Pages/Sidebar'; // Import Sidebar

const minioClient = new Minio.Client({
    endPoint: '127.0.0.1',
    port: 5000,
    useSSL: false,
    accessKey: '12345678',
    secretKey: '12345678'
});

export const RunUpload: React.FC = () => {
    const history = useHistory();
    const { Id } = useIdStore();

    const [startTime, setStartTime] = useState<Date | null>(null);
    const [finishTime, setFinishTime] = useState<Date | null>(null);
    const [distance, setDistance] = useState<string>('');
    const [clickCount, setClickCount] = useState<number>(0);
    const [submitted, setSubmitted] = useState<boolean>(false);
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
                // Upload image to MinIO
                await minioClient.fPutObject('proof', filename, uploadedImage.path, {});

                const studentIdNumber = parseInt(Id);
                const distanceNumber = parseFloat(distance) * 10;

                const submitMessage = new SubmitRunningMessage(
                    studentIdNumber,
                    startTime.getTime().toString(),
                    finishTime.getTime().toString(),
                    distanceNumber,
                    `http://127.0.0.1:5000/proof/${filename}`
                );

                // Send the running data
                const response = await sendPostRequest(submitMessage);
                console.log('Submit Running Message Response:', response);
                setSubmitted(true);
                setError(null);

                // Fetch the student's name for the notification
                const studentName = await fetchStudentName(studentIdNumber);
                const taId = await fetchTAId(studentIdNumber); // Fetch TA ID based on student ID
                const notificationMessage = new ReleaseNotificationMessage(
                    studentIdNumber,
                    taId,
                    `有待审核的跑步记录，来自学生 ${studentName}`
                );

                // Send the notification
                await sendPostRequest(notificationMessage);
                console.log('Release Notification Response:', response);

                // Navigate back to the previous page
                history.goBack();
            } catch (error) {
                console.error('Error handling image upload and submission:', error);
                setError('处理上传和提交时出错，请稍后再试。');
            }
        }
    };

    const fetchStudentName = async (studentId: number) => {
        const fetchMessage = new FetchNameMessage(studentId);
        const response = await sendPostRequest(fetchMessage);
        return response.data; // Adjust according to the actual response structure
    };

    const fetchTAId = async (studentId: number) => {
        const fetchMessage = new GetTAMessage(studentId); // Use GetTAMessage to fetch TA ID
        const response = await sendPostRequest(fetchMessage);
        return response.data; // Adjust according to the actual response structure
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
        <div className={runupload_styles.pageContainer}>
            <Sidebar />
            <div className={runupload_styles.runUploadPage}>
                <h1 className={runupload_styles.runuploadHeader}>阳光长跑记录</h1>
                {error && <p className={runupload_styles.errorMessage}>{error}</p>}
                <div className={runupload_styles.timestampBox}>
                    <p>开始时间: {startTime ? startTime.toLocaleString() : '-'}</p>
                    <p>结束时间: {finishTime ? finishTime.toLocaleString() : '-'}</p>
                </div>
                <div className={runupload_styles.distanceInput}>
                    <label htmlFor="distance">距离/千米</label>
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
                <div className={runupload_styles.imageUpload}>
                    <label htmlFor="file-upload">上传图片证明</label>
                    <input
                        type="file"
                        id="file-upload"
                        onChange={handleImageUpload}
                        accept="image/*"
                    />
                    {uploadedImageUrl && (
                        <img src={uploadedImageUrl} alt="Uploaded" className={runupload_styles.uploadedImage} />
                    )}
                </div>
                <div className={runupload_styles.buttonGroup}>
                    <button className={runupload_styles.startButton} onClick={handleStartFinishRunning}
                            disabled={clickCount >= 2}>
                        {clickCount === 0 ? '开始跑步' : '停止跑步'}
                    </button>
                    <button className={runupload_styles.submitButton} onClick={handleSubmit}
                            disabled={!startTime || !finishTime || !distance || !uploadedImage || submitted}>
                        提交记录
                    </button>
                    <button className={runupload_styles.cancelButton} onClick={handleCancel}>
                        回到主页
                    </button>
                </div>
                {submitted && <p className={runupload_styles.submittedMessage}>Run data submitted successfully!</p>}
            </div>
        </div>
    );
};

export default RunUpload;