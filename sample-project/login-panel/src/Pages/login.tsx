import React, { useState } from 'react';
import { useHistory } from 'react-router';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import { LoginMessage } from 'Plugins/DoctorAPI/LoginMessage';
import login_style from './login.module.css';
import useIdStore from './IdStore';
import useTokenStore from './TokenStore';

export function Login() {
    const history = useHistory();
    const [password, setPassword] = useState('');
    const [identity, setIdentity] = useState('student');
    const [error, setError] = useState('');
    const { Id, setId, updateId } = useIdStore();
    const { setToken } = useTokenStore();

    const handleLogin = async () => {
        try {
            const identityMap: Record<string, number> = {
                admin: 1,
                student: 2,
                ta: 3,
            };

            const studentIdNumber = parseInt(Id);

            const loginMessage = new LoginMessage(studentIdNumber, password, identityMap[identity]);

            const response = await sendPostRequest(loginMessage);

            console.log('Login Response:', response);

            if (response.status==200 && response.data !== 'Invalid user') {
                // Update studentId and token in Zustand only if login succeeds
                updateId(Id);
                setToken(response.data); // Assuming the token is part of the response

                switch (identity) {
                    case 'admin':
                        history.push('/admin/root');
                        break;
                    case 'student':
                        history.push('/student_dashboard');
                        break;
                    case 'ta':
                        history.push('/ta_dashboard');
                        break;
                    default:
                        history.push('/');
                }
            } else {
                setError("Invalid credentials. Please try again.");
            }
        } catch (error) {
            console.error('Login Error:', error.message);
            setError("Login failed. Please try again.");
        }
    };

    const handleStudentIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setId(value);
    };

    return (
        <div className={login_style.login_container}>
            <div className={login_style.login_box}>
                <header className={login_style.login_header}>
                    <h1>欢迎回来!</h1>
                    <p>请登录你的用户</p>
                </header>
                <div className={`${login_style.formContainer}`}>
                    {error && <p className={`${login_style.error_message}`}>{error}</p>}
                    <div className={login_style.form_group}>
                        <label htmlFor="user_id">用户ID</label>
                        <input
                            align={"center"}
                            type="text"
                            id="user_id"
                            value={Id}
                            onChange={handleStudentIdChange}
                            required
                        />
                    </div>
                    <div className={login_style.form_group}>
                        <label htmlFor="password">密码</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className={login_style.form_group}>
                        <label htmlFor="identity">身份</label>
                        <select
                            id="identity"
                            value={identity}
                            onChange={(e) => setIdentity(e.target.value)}
                            required
                        >
                            <option value="admin">Admin</option>
                            <option value="student">Student</option>
                            <option value="ta">TA</option>
                        </select>
                    </div>
                    <div className={login_style.button_group}>
                        <button className={login_style.submit_button} onClick={handleLogin}>提交</button>
                        <button className={login_style.back_button} onClick={() => history.push('/')}>返回</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
