import React, { useState } from 'react';
import axios, { isAxiosError } from 'axios'
import { API } from 'Plugins/CommonUtils/API'
import { LoginMessage } from 'Plugins/DoctorAPI/LoginMessage'
import { RegisterMessage } from 'Plugins/DoctorAPI/RegisterMessage'
import { PatientLoginMessage } from 'Plugins/PatientAPI/PatientLoginMessage'
import { PatientRegisterMessage } from 'Plugins/PatientAPI/PatientRegisterMessage'
import { AddPatientMessage } from 'Plugins/DoctorAPI/AddPatientMessage'
import { useHistory } from 'react-router';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils'
import './login.css';

export function Login() {
    const history = useHistory();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    return (
        <div className="login-container">
            <div className="login-box">
                <header className="login-header">
                    <h1>Welcome Back!</h1>
                    <p>Please login to your account</p>
                </header>
                <main>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button className="fancy-btn" onClick={() => sendPostRequest(new LoginMessage(username, password))}>
                        Submit
                    </button>
                </main>
            </div>
        </div>
    );
}