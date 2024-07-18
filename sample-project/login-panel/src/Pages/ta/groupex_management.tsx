import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { useHistory } from 'react-router-dom';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import useIdStore from 'Pages/IdStore';
import { CreateGroupexMessage } from 'Plugins/GroupExAPI/CreateGroupexMessage';
import { TAQueryMessage } from 'Plugins/GroupExAPI/TAQueryMessage';
import { AxiosResponse } from 'axios';
import TA_ExerciseCard from './ta_ExerciseCard';
import Sidebar from "Pages/Sidebar";
import groupex_management_style from './groupex_management.module.css';

Modal.setAppElement('#root');

interface TAQueryResult {
    finishtime: string;
    groupexID: number;
    location: string;
    status: number;
    starttime: string;
    token: string;
    ex_name: string;
}

export const GroupexManagement: React.FC = () => {
    const history = useHistory();
    const { Id } = useIdStore();
    const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [startTime, setStartTime] = useState<string>('');
    const [finishTime, setFinishTime] = useState<string>('');
    const [location, setLocation] = useState<string>('');
    const [exName, setExName] = useState<string>('');
    const [taQueryResult, setTaQueryResult] = useState<TAQueryResult[]>([]);
    const [viewType, setViewType] = useState<string>('未开始');

    useEffect(() => {
        const fetchTAQuery = async () => {
            const taQueryMessage = new TAQueryMessage(parseInt(Id));
            try {
                const response: AxiosResponse<TAQueryResult[]> = await sendPostRequest(taQueryMessage);
                setTaQueryResult(response.data);
            } catch (error) {
                setError('TA查询失败，请重试。');
            }
        };

        fetchTAQuery();
    }, [Id]);

    const openModal = () => {
        setModalIsOpen(true);
        const currentTime = new Date();
        const localTime = new Date(currentTime.getTime() + 8 * 60 * 60 * 1000);
        setStartTime(localTime.toISOString().slice(0, 16));
        setFinishTime('');
        setLocation('');
        setExName('');
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    const handleCreateGroupex = async () => {
        if (!startTime || !finishTime || !exName) {
            setError('请填写开始时间、结束时间和锻炼名称。');
            return;
        }

        const startTimestamp = new Date(new Date(startTime).getTime() - 8 * 60 * 60 * 1000).getTime();
        const finishTimestamp = new Date(new Date(finishTime).getTime() - 8 * 60 * 60 * 1000).getTime();

        const groupexMessage = new CreateGroupexMessage(
            exName,
            parseInt(Id),
            startTimestamp.toString(),
            finishTimestamp.toString(),
            location
        );

        try {
            await sendPostRequest(groupexMessage);
            closeModal();
            const response: AxiosResponse<TAQueryResult[]> = await sendPostRequest(new TAQueryMessage(parseInt(Id)));
            setTaQueryResult(response.data);
        } catch (error) {
            setError('创建失败，请重试。');
        }
    };

    const currentTime = Date.now();
    const notStarted = taQueryResult.filter(item => parseInt(item.starttime) > currentTime - 8 * 60 * 60 * 1000);
    const ongoing = taQueryResult.filter(item =>
        parseInt(item.starttime) <= currentTime - 8 * 60 * 60 * 1000 &&
        parseInt(item.finishtime) > currentTime - 8 * 60 * 60 * 1000 &&
        (item.status !== 4)
    );
    const ended = taQueryResult.filter(item =>
        parseInt(item.finishtime) <= currentTime - 8 * 60 * 60 * 1000 ||
        (item.status === 4)
    );

    const displayItems = viewType === '未开始' ? notStarted : viewType === '正在进行' ? ongoing : ended;

    const convertToLocalTime = (utcString: string) => {
        const localTime = new Date(parseInt(utcString) + 8 * 60 * 60 * 1000);
        return localTime.getTime().toString();
    };

    return (
        <div className={groupex_management_style.App}>
            <Sidebar />
            <div className={groupex_management_style.groupexManagementContainer}>
                <h1>集体锻炼管理</h1>
                {error && <p className={groupex_management_style.errorMessage}>{error}</p>}

                <h2>信息查询</h2>
                <div className={groupex_management_style.viewTypeButtons}>
                    <button onClick={() => setViewType('未开始')}>未开始</button>
                    <button onClick={() => setViewType('正在进行')}>正在进行</button>
                    <button onClick={() => setViewType('已结束')}>已结束</button>
                </div>

                <div className={groupex_management_style.exerciseContainer}>
                    <h3>查询结果</h3>
                    <div className={groupex_management_style.exerciseCardContainer}>
                        {displayItems.map((item: TAQueryResult) => (
                            <TA_ExerciseCard
                                key={item.groupexID}
                                groupexID={item.groupexID}
                                startTime={convertToLocalTime(item.starttime)}
                                finishTime={convertToLocalTime(item.finishtime)}
                                location={item.location}
                                exName={item.ex_name}
                                status={item.status}
                                studentIDs={[]}
                                updateStatus={(newStatus: any) => {
                                    setTaQueryResult(prev => prev.map(exercise => exercise.groupexID === item.groupexID ? {
                                                ...exercise,
                                                status: newStatus
                                            } : exercise
                                        )
                                    );
                                }} />
                        ))}
                    </div>
                </div>

                <button className={groupex_management_style.button} onClick={openModal}>
                    创建 Group Exercise
                </button>
                <button className={groupex_management_style.button} onClick={() => history.push('/ta_dashboard')}>
                    返回 TA 仪表盘
                </button>

                <Modal
                    isOpen={modalIsOpen}
                    onRequestClose={closeModal}
                    contentLabel="Create Group Exercise"
                    className={groupex_management_style.groupexModal}
                    overlayClassName={groupex_management_style.groupexModalOverlay}
                >
                    <div className={groupex_management_style.modalHeader}>
                        <h2>创建 Group Exercise</h2>
                        <button className={groupex_management_style.closeButton} onClick={closeModal}>
                            &times;
                        </button>
                    </div>
                    <div className={groupex_management_style.modalBody}>
                        <div>
                            <label>锻炼名称: </label>
                            <input
                                type="text"
                                value={exName}
                                onChange={(e) => setExName(e.target.value)} />
                        </div>
                        <div>
                            <label>开始时间: </label>
                            <input
                                type="datetime-local"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)} />
                        </div>
                        <div>
                            <label>结束时间: </label>
                            <input
                                type="datetime-local"
                                value={finishTime}
                                onChange={(e) => setFinishTime(e.target.value)} />
                        </div>
                        <div>
                            <label>地点: </label>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)} />
                        </div>
                    </div>
                    <div className={groupex_management_style.modalFooter}>
                        <button className={groupex_management_style.button} onClick={handleCreateGroupex}>
                            创建
                        </button>
                        <button className={groupex_management_style.button} onClick={closeModal}>
                            取消
                        </button>
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default GroupexManagement;
