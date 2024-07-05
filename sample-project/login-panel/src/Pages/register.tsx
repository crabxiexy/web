import React, { useState } from 'react';
import { RegisterMessage } from 'Plugins/DoctorAPI/RegisterMessage';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import { useHistory } from 'react-router';

export function Register() {
    const history = useHistory();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [identity, setIdentity] = useState('');
    const [error, setError] = useState('');

    const handleRegister = async () => {
        try {
            const message = new RegisterMessage(username, password, identity);
            const response = await sendPostRequest(message);
            // Handle successful response
            console.log('Response status:', response.status);
            console.log('Response data:', response.data);
            // Optionally, navigate to another page upon successful registration
            history.push('/root'); // Example navigation
        } catch (error) {
            // Handle error
            console.error('Error:', error.message);
            setError(error.message); // Update state with error message
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

                    {error && <p className="error-message">{error}</p>}

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
                            type="text"
                            value={identity}
                            onChange={e => setIdentity(e.target.value)}
                            required
                        />
                    </div>
                    <button onClick={handleRegister}>Submit</button>
                    <button onClick={() => history.push("/root")}>
                       back
                    </button>
                </div>
            </main>
        </div>
    );
}