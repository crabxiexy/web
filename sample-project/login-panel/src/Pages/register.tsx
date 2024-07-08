import React, { useState } from 'react';
import { RegisterMessage } from 'Plugins/DoctorAPI/RegisterMessage';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import { useHistory } from 'react-router';
import './register.css';

export function Register() {
    const history = useHistory();
    const [student_id, setStudentId] = useState(0);
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [identity, setIdentity] = useState('student');
    const [error, setError] = useState('');

    const identityMap: Record<string, number> = {
        admin: 1,
        student: 2,
        ta: 3,
        leader: 4
    };

    const handleRegister = async () => {
        if (password !== repeatPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            const identityNumber = identityMap[identity];
            const message = new RegisterMessage(student_id, name, password, identityNumber);
            const response = await sendPostRequest(message);
            if (response.status === 200) {
                history.push('/root');
            }
        } catch (error) {
            setError(error.message);
        }
    };

    const navigateTo = (path: string) => {
        history.push(path);
    };

    return (
        <div className="register-container">
            <header className="register-header">
                <div className="logo" onClick={() => navigateTo('/home')}>MyApp</div>
                <nav>
                    <ul>
                        <li onClick={() => navigateTo('/')}>Home</li>
                    </ul>
                </nav>
            </header>
            <main className="main-content">
                <div className="form-container">
                    <h2>Create an Account</h2>
                    {error && <p className="error-message">{error}</p>}
                    <div className="form-group">
                        <input
                            type="number"
                            value={student_id}
                            onChange={e => setStudentId(parseInt(e.target.value))}
                            required
                            placeholder="Student ID"
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                            placeholder="Username"
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            placeholder="Password"
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            value={repeatPassword}
                            onChange={e => setRepeatPassword(e.target.value)}
                            required
                            placeholder="Repeat Password"
                        />
                    </div>
                    <div className="form-group">
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
                    <div className="button-group">
                        <button className="submit-button" onClick={handleRegister}>Submit</button>
                        <button className="back-button" onClick={() => navigateTo('/')}>Back</button>
                    </div>
                </div>
            </main>
        </div>
    );
}