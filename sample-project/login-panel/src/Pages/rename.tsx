import React, { useState } from 'react';
import { useHistory } from 'react-router';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import { RenameMessage } from 'Plugins/DoctorAPI/RenameMessage';
import { CheckTokenMessage } from 'Plugins/DoctorAPI/CheckTokenMessage'; // Adjust the path as necessary
import re_style from './rename.module.css'; // Import CSS module
import useIdStore from './IdStore';
import useTokenStore from './TokenStore';

export function Rename() {
    const history = useHistory();
    const [old_password, setOldPassword] = useState('');
    const [new_password, setNewPassword] = useState('');
    const [error, setError] = useState('');

    const handleRename = async () => {
        try {
            // Your existing logic here

        } catch (error) {
            console.error('Rename Error:', error.message);
            setError(error.message); // Update state with error message
        }
    };

    return (
        <div className={re_style.rename_container}>
            <div className={re_style.rename_box}>
                <header className={re_style.rename_header}>
                    <h1>密码重置</h1>
                </header>
                <main>
                    {error && <p className={re_style.error_message}>{error}</p>}
                    <div className={re_style.form_group}>
                        <label className={re_style.lbl}>旧密码</label>
                        <input className={re_style.textInput}
                            type="text"
                            value={old_password}
                            onChange={e => setOldPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className={re_style.form_group}>
                        <label className={re_style.lbl}>新密码</label >
                        <input className={re_style.textInput}
                            type="password"
                            value={new_password}
                            onChange={e => setNewPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className={re_style.button_group}>
                        <button className={re_style.btn} onClick={handleRename}>
                            提交
                        </button>
                        <button className={re_style.btn} onClick={() => history.push("/admin/root")}>
                            返回
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
}
