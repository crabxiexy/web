import React, { useState } from 'react';
import axios, { isAxiosError } from 'axios'
import { API } from 'Plugins/CommonUtils/API'

import { RegisterMessage } from 'Plugins/DoctorAPI/RegisterMessage'

import { useHistory } from 'react-router';

export function Register() {
    const history = useHistory();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [identity, setIdentity] = useState('');

    const sendPostRequest = async (message:API) => {
        try {
            const response = await axios.post(message.getURL(), JSON.stringify(message), {
                headers: { 'Content-Type': 'application/json' },
            });
            console.log('Response status:', response.status);
            console.log('Response body:', response.data);
            // Assuming the response is a string "valid" or "invalid
            history.push("/root"); // Navigate to /dashboard upon successful login

        } catch (error) {
            if (isAxiosError(error)) {
                if (error.response && error.response.data) {
                    console.error('Error sending request:', error.response.data);
                } else {
                    console.error('Error sending request:', error.message);
                }
            } else {
                console.error('Unexpected error:', error);
            }
        }
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>HTTP Post Requests</h1>
            </header>
            <main>
                <div className="login-container">
                    <h2>Register</h2>

                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Identity</label>
                        <input
                            type="identity"
                            value={identity}
                            onChange={e => setIdentity(e.target.value)}
                            required
                        />
                    </div>
                    <button onClick={() => sendPostRequest(new RegisterMessage(username, password, identity))}>
                        submit

                    </button>

                </div>
            </main>
        </div>
    );
}