import React, { useState } from 'react';
import { useHistory } from 'react-router';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import { LoginMessage } from 'Plugins/DoctorAPI/LoginMessage'; // Assuming LoginMessage is correctly imported
import './login.css';
import useStudentIdStore from './studentIdStore'; // Adjust the path based on your file structure

export function Login() {
    const history = useHistory();
    const [password, setPassword] = useState('');
    const [identity, setIdentity] = useState('student');
    const [error, setError] = useState('');

    const { studentId, setStudentId, updateStudentId } = useStudentIdStore();

    const handleLogin = async () => {
        try {
            const identityMap: Record<string, number> = {
                admin: 1,
                student: 2,
                ta: 3,
                leader: 4
            };

            // Ensure student_id is parsed as needed (if it's used as a number)
            const studentIdNumber = parseInt(studentId); // Adjust parsing as necessary

            // Construct the login message object
            const loginMessage = new LoginMessage(studentIdNumber, password, identityMap[identity]);

            // Send the login request
            const response = await sendPostRequest(loginMessage);

            console.log('Login Response:', response);

            if (response && response.data === "Valid user") {
                // Update studentId in Zustand only if login succeeds
                updateStudentId(studentId);

                switch (identity) {
                    case 'admin':
                        history.push('/root');
                        break;
                    case 'student':
                        history.push('/student-dashboard');
                        break;
                    case 'ta':
                        history.push('/ta-dashboard');
                        break;
                    case 'leader':
                        history.push('/leader-dashboard');
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
        setStudentId(value);
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
                            value={studentId}
                            onChange={handleStudentIdChange}
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
                    <div className="form-group">
                        <label htmlFor="identity">Identity</label>
                        <select
                            id="identity"
                            value={identity}
                            onChange={(e) => setIdentity(e.target.value)}
                            required
                        >
                            <option value="admin">Admin</option>
                            <option value="student">Student</option>
                            <option value="ta">TA</option>
                            <option value="leader">Leader</option>
                        </select>
                    </div>
                    <button className="button" onClick={handleLogin}>
                        Submit
                    </button>
                </main>
            </div>
        </div>
    );
}