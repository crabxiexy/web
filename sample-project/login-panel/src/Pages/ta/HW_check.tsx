import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { useHistory } from 'react-router-dom';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import useIdStore from 'Pages/IdStore';
import { TAQueryHWMessage } from 'Plugins/HWAPI/TAQueryHWMessage';
import { AxiosResponse } from 'axios';


Modal.setAppElement('#root');

interface TAQueryHWResult {
    HW_id: number;
    startTime: string;
    finishTime: string;
    submitTime: string;
    HW_name: string;
    student_id: number;
    leader_id: number;
    TA_id: number;
    club_name: string;
    imgUrl: string;
    is_checked: boolean;
    response: string;
}

export const HWCheck: React.FC = () => {
    const history = useHistory();
    const { Id } = useIdStore();
    const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [hwQueryResult, setHWQueryResult] = useState<TAQueryHWResult[]>([]);

    useEffect(() => {
        const fetchTAQueryHW = async () => {
            const taQueryHWMessage = new TAQueryHWMessage(parseInt(Id));
            try {
                const response: AxiosResponse<TAQueryHWResult[]> = await sendPostRequest(taQueryHWMessage);
                setHWQueryResult(response.data);
            } catch (error) {
                setError('TA查询作业记录失败，请重试。');
            }
        };

        fetchTAQueryHW();
    }, [Id]);

    return (
        <div className="hw-management-container">
            <h1>Homework Management</h1>
            {error && <p className="error-message">{error}</p>}

            <div className="hw-query-result">
                <h3>TA查询作业记录:</h3>
                <div className="hw-card-container" style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
                    {hwQueryResult.map((item: TAQueryHWResult) => (
                        <li key={item.HW_id}>
                            <p>作业ID: {item.HW_id}</p>
                            <p>开始时间: {item.startTime}</p>
                            <p>结束时间: {item.finishTime}</p>
                            <p>提交时间: {item.submitTime}</p>
                            <p>活动名称: {item.HW_name}</p>
                            <p>学生ID: {item.student_id}</p>
                            <p>组长ID: {item.leader_id}</p>
                            <p>TA ID: {item.TA_id}</p>
                            <p>社团名称: {item.club_name}</p>
                            <p>图片URL: {item.imgUrl}</p>
                            <p>是否已检查: {item.is_checked ? '是' : '否'}</p>
                            <p>TA回复: {item.response}</p>
                        </li>
                    ))}
                </div>
            </div>

            <button className="button" onClick={() => history.push('/ta_dashboard')}>
                返回 TA 仪表盘
            </button>


        </div>
    );
};

export default HWCheck;
