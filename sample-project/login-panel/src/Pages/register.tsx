import React, { useState } from 'react';
import { RegisterMessage } from 'Plugins/DoctorAPI/RegisterMessage'; // Import DoctorMessage
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import { useHistory } from 'react-router';
export function Register() {
    const history = useHistory();
    const [student_id, setStudentId] = useState(0); // Changed to number for student_id
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [identity, setIdentity] = useState('student'); // Default identity as string
    const [error, setError] = useState('');

    // Mapping of identity string to corresponding number
    const identityMap:Record<string, number> = {
        admin: 1,
        student: 2,
        ta: 3,
        leader: 4
    };

    const handleRegister = async () => {
        try {
            // Ensure identity is converted to number based on identityMap
            const identityNumber = identityMap[identity];

            // Create DoctorMessage object with appropriate fields
            const message = new RegisterMessage(student_id, username, password, identityNumber);

            // Send post request with DoctorMessage object
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
                        <label>Student ID</label>
                        <input
                            type="number" // Ensure input type matches the expected type
                            value={student_id}
                            onChange={e => setStudentId(parseInt(e.target.value))}
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
                    <div className="form-group">
                        <label>Identity</label>
                        <select
                            value={identity}
                            onChange={e => setIdentity(e.target.value)}
                            required
                        >
                            <option value="admin">Admin</option>
                            <option value="student">Student</option>
                            <option value="ta">TA</option>
                            <option value="leader">Leader</option>
                        </select>
                    </div>
                    <button onClick={handleRegister}>Submit</button>
                    <button onClick={() => history.push("/root")}>
                        Back
                    </button>
                </div>
            </main>
        </div>
    );
}