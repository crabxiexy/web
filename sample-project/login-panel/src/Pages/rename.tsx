import React, { useState } from 'react';
import { useHistory } from 'react-router';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import { RenameMessage } from 'Plugins/DoctorAPI/RenameMessage';
import './login.css';

export function Rename() {
    const history = useHistory();
    const [id, setId] = useState<string>(''); // State for ID as string
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>(''); // State for error message

    const handleRename = async () => {
        try {
            // Convert id to number if needed
            const idNumber = parseInt(id, 10); // Example: parsing as integer

            const response = await sendPostRequest(new RenameMessage( username, password,idNumber));

            // Handle successful response
            console.log('Rename Response:', response);

            // Example: Redirect to root page upon successful rename
            history.push('/root');

        } catch (error) {
            // Handle error
            console.error('Rename Error:', error.message);
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
                    <h2>Rename</h2>

                    {error && <p className="error-message">{error}</p>}
                    <div className="form-group">
                        <label>ID</label>
                        <input
                            type="text"
                            value={id}
                            onChange={e => setId(e.target.value)}
                            required
                        />
                    </div>
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
                    <button onClick={handleRename}>
                        Submit
                    </button>
                    <button onClick={() => history.push("/root")}>
                        Back
                    </button>

                </div>
            </main>
        </div>
    );
}