import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils'; // 根据项目结构调整导入路径
import { TAQueryRunningMessage } from 'Plugins/RunAPI/TAQueryRunningMessage'; // 根据项目结构调整导入路径
import useIdStore from 'Pages/IdStore'; // 根据项目结构调整导入路径
import { CheckRunningMessage } from 'Plugins/RunAPI/CheckRunningMessage'; // 根据项目结构调整导入路径
import Modal from 'react-modal'; // 引入 react-modal 组件

Modal.setAppElement('#root');

// 定义每个 run 对象的接口
interface Run {
    runID: number;
    starttime: string;
    finishtime: string;
    submittime: string;
    distance: number;
    imgurl: string;
    response: string;
    speed: number; // 根据需求添加 speed 属性
}

export const RunningCheck = () => {
    const history = useHistory();
    const [error, setError] = useState<string>('');
    const [result, setResult] = useState<Run[]>([]); // 使用 Run 接口定义结果状态
    const [editData, setEditData] = useState<{ [key: number]: { response: string } }>({}); // 存储编辑数据的状态
    const [modalIsOpen, setModalIsOpen] = useState<boolean>(false); // 控制弹窗显示状态
    const [selectedImageUrl, setSelectedImageUrl] = useState<string>(''); // 保存选中的图片 URL

    // 从 Zustand hook 获取 ta_id
    const { Id } = useIdStore(); // 假设 Zustand hook 的导入方式是这样的，根据实际情况调整

    // 函数用于解码时间戳为可读格式
    const decodeTimestamp = (timestamp: string): string => {
        const date = new Date(parseInt(timestamp));
        return date.toLocaleString(); // 根据需要调整格式
    };

    // 处理 TA 查询
    const handleTAQuery = async () => {
        try {
            const taQueryMessage = new TAQueryRunningMessage(parseInt(Id));
            const response = await sendPostRequest(taQueryMessage);
            console.log('TA 查询响应:', response);

            if (response && response.data) {
                setResult(response.data.map((run: Run) => ({
                    ...run,
                    speed: calculateSpeed(run.distance, run.starttime, run.finishtime),
                })));
                setError('');
            } else {
                setError('TA 查询失败，请重试。');
            }
        } catch (error) {
            console.error('TA 查询错误:', error.message);
            setError('TA 查询失败，请重试。');
        }
    };

    // 根据提供的公式计算速度
    const calculateSpeed = (distance: number, startTime: string, finishTime: string): number => {
        const startTimestamp = parseInt(startTime);
        const finishTimestamp = parseInt(finishTime);
        const timeDifference = (finishTimestamp - startTimestamp) / 1000; // 转换为秒
        return distance / 10 / (timeDifference / 60); // km/h
    };

    // 处理 response 的更改
    const handleFieldChange = (runId: number, fieldName: 'response', value: string) => {
        setEditData((prevData) => ({
            ...prevData,
            [runId]: {
                ...prevData[runId],
                [fieldName]: value,
            },
        }));
    };

    // 处理点击图片按钮
    const handleImageClick = (imageUrl: string) => {
        setSelectedImageUrl(imageUrl);
        setModalIsOpen(true);
    };

    // 处理关闭弹窗
    const closeModal = () => {
        setModalIsOpen(false);
        setSelectedImageUrl('');
    };

    // 处理通过按钮点击
    const handleCheck = async (runId: number) => {
        const { response } = editData[runId];
        const checkRunningMessage = new CheckRunningMessage(runId, 1, response); // 设置 is_checked 为 1 表示通过

        try {
            const response = await sendPostRequest(checkRunningMessage);
            console.log('提交响应:', response);

            // 从结果状态中移除已提交的行
            setResult((prevResult) => prevResult.filter((run) => run.runID !== runId));

            // 可选：处理提交成功后的消息或界面更新
        } catch (error) {
            console.error('提交错误:', error.message);
            setError('提交失败，请重试。');
        }
    };

    // 处理拒绝按钮点击
    const handleReject = async (runId: number) => {
        const { response } = editData[runId];
        const checkRunningMessage = new CheckRunningMessage(runId, 2, response); // 设置 is_checked 为 2 表示拒绝

        try {
            const response = await sendPostRequest(checkRunningMessage);
            console.log('提交响应:', response);

            // 从结果状态中移除已提交的行
            setResult((prevResult) => prevResult.filter((run) => run.runID !== runId));

            // 可选：处理提交成功后的消息或界面更新
        } catch (error) {
            console.error('提交错误:', error.message);
            setError('提交失败，请重试。');
        }
    };

    return (
        <div className="running-check-container">
            <h1>Running Check</h1>
            {error && <p className="error-message">{error}</p>}
            <div className="button-group">
                <button className="button" onClick={() => history.push('/ta_dashboard')}>
                    返回 TA 仪表盘
                </button>
                <button className="button" onClick={handleTAQuery}>
                    执行 TA 查询
                </button>
            </div>
            {result && (
                <div className="query-result">
                    <h3>TA 查询结果:</h3>
                    <table className="table">
                        <thead>
                        <tr>
                            <th>开始时间</th>
                            <th>结束时间</th>
                            <th>提交时间</th>
                            <th>距离</th>
                            <th>查看图片</th>
                            <th>回复</th>
                            <th>速度 (km/h)</th>
                            <th>操作</th>
                        </tr>
                        </thead>
                        <tbody>
                        {result.map((run: Run, index: number) => (
                            <tr key={index}>
                                <td>{decodeTimestamp(run.starttime)}</td>
                                <td>{decodeTimestamp(run.finishtime)}</td>
                                <td>{decodeTimestamp(run.submittime)}</td>
                                <td>{run.distance / 10}</td>
                                <td>
                                    <button
                                        className="button"
                                        onClick={() => handleImageClick(run.imgurl)}
                                    >
                                        查看图片
                                    </button>
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        value={editData[run.runID]?.response ?? run.response}
                                        onChange={(e) =>
                                            handleFieldChange(run.runID, 'response', e.target.value)
                                        }
                                    />
                                </td>
                                <td>{run.speed.toFixed(2)}</td>
                                <td>
                                    <button className="button" onClick={() => handleCheck(run.runID)}>
                                        通过
                                    </button>
                                    <button className="button" onClick={() => handleReject(run.runID)}>
                                        拒绝
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
            {/* 弹窗显示图片 */}
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Image Modal"
                className="image-modal"
                overlayClassName="image-modal-overlay"
            >
                <div className="modal-header">
                    <button className="close-button" onClick={closeModal}>
                        &times;
                    </button>
                </div>
                <div className="modal-body">
                    <img
                        src={selectedImageUrl}
                        alt="Selected"
                        style={{ maxWidth: '100%', maxHeight: '100%' }}
                    />
                </div>
            </Modal>
        </div>
    );
};

export default RunningCheck;
