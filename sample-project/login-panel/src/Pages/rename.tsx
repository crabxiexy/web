import React, { useState } from 'react';
import { useHistory } from 'react-router';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import { RenameMessage } from 'Plugins/DoctorAPI/RenameMessage';
import { validateToken } from 'Plugins/ValidateToken'; // Adjust the path as necessary
import re_style from './rename.module.css'; // Import CSS module
import useIdStore from 'Plugins/IdStore';
import useTokenStore from 'Plugins/TokenStore';

export function Rename() {
    const history = useHistory();
    const { Id } = useIdStore();
    const { Token } = useTokenStore();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');

    const handleRename = async () => {
        try {
            // Validate token
            const isValidToken = await validateToken(Id, Token);

            if (!isValidToken) {
                setError('Token is invalid. Please log in again.');
                history.push('/login'); // Redirect to login page
                return;
            }

            // Proceed with renaming if token is valid
            const renameMessage = new RenameMessage(parseInt(Id), oldPassword, newPassword);
            await sendPostRequest(renameMessage);
            setError('');
            history.push('/admin/root'); // Redirect to root page

        } catch (error) {
            console.error('Rename Error:', error.message);
            setError('Failed to rename password. Please try again later.');
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
                               value={oldPassword}
                               onChange={e => setOldPassword(e.target.value)}
                               required
                        />
                    </div>
                    <div className={re_style.form_group}>
                        <label className={re_style.lbl}>新密码</label>
                        <input className={re_style.textInput}
                               type="password"
                               value={newPassword}
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
