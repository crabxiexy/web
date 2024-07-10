import React, { useState } from 'react';
import { useHistory } from 'react-router';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import { LoginMessage } from 'Plugins/DoctorAPI/LoginMessage'; // Assuming LoginMessage is correctly imported
import './login.css';
import useStudentIdStore from './IdStore'; // Adjust the path based on your file structure


export function Login() {
    const history = useHistory();
    const [password, setPassword] = useState('');
    const [identity, setIdentity] = useState('student');
    const [error, setError] = useState('');

    const { Id, setId, updateId } = useStudentIdStore();

    const handleLogin = async () => {
        try {
            const identityMap: Record<string, number> = {
                admin: 1,
                student: 2,
                ta: 3,
            };

            // Ensure student_id is parsed as needed (if it's used as a number)
            const studentIdNumber = parseInt(Id); // Adjust parsing as necessary

            // Construct the login message object
            const loginMessage = new LoginMessage(studentIdNumber, password, identityMap[identity]);

            // Send the login request
            const response = await sendPostRequest(loginMessage);

            console.log('Login Response:', response);

            if (response && response.data === "Valid user") {
                // Update studentId in Zustand only if login succeeds
                updateId(Id);

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
        <div className="login-container">
            <div className="login-box">
                <header className="login-header">
                    <h1>Welcome Back!</h1>
                    <p>Please login to your account</p>
                </header>
                <main>
                    {error && <p className="error-message">{error}</p>}
                    <div className="form-group">
                        <label htmlFor="user_id">User_ID</label>
                        <input
                            type="text"
                            id="user_id"
                            value={Id}
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
                        </select>
                    </div>
                    <div className="button-group">
                        <button className="submit-button" onClick={handleLogin}>Submit</button>
                        <button className="back-button" onClick={() => history.push('/')}>Back</button>
                    </div>
                </main>
            </div>
        </div>
    );
}