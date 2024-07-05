import React, { useState } from 'react';
import { useHistory } from 'react-router';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import { LoginMessage } from 'Plugins/DoctorAPI/LoginMessage';
import './login.css';

export function Login() {
    const history = useHistory();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async () => {
        try {
            const response = await sendPostRequest(new LoginMessage(username, password));
            // Handle successful response
            console.log('Login Response:', response);
            if (response.data == "Valid user") {
                // Example: Navigate to dashboard upon successful login
                history.push('/root');
            }
        } catch (error) {
            // Handle error
            console.error('Login Er, error.message');
            setError(error.message); // Update state with error message
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <header className="login-header">
                    <h1>Welcome Back!</h1>
                    <p>Please login to your account</p>
                </header>
                <main>
                    {error && <p className="error-message">{error}</p>}
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
                    <button className="fancy-btn" onClick={handleLogin}>
                        Submit
                    </button>
                </main>
            </div>
        </div>
    );
}