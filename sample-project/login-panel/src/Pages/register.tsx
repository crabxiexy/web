import React, { useState } from 'react';
import { RegisterMessage } from 'Plugins/DoctorAPI/RegisterMessage';
import { AssignDepartmentMessage } from 'Plugins/StudentAPI/AssignDepartmentMessage'; // Import AssignDepartmentMessage
import { AssignClassMessage } from 'Plugins/StudentAPI/AssignClassMessage'; // Import AssignClassMessage
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
    const [department, setDepartment] = useState('');
    const [classname, setClassname] = useState('');

    const identityMap: Record<string, number> = {
        admin: 1,
        student: 2,
        ta: 3,
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
                if (identity === 'student') {
                    const assignDepartmentMessage = new AssignDepartmentMessage(student_id, department);
                    const assignClassMessage = new AssignClassMessage(student_id, classname);

                    // Send department and class assignment messages
                    await sendPostRequest(assignDepartmentMessage);
                    await sendPostRequest(assignClassMessage);
                }
                history.push('/admin/root'); // Redirect after successful registration
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
                            onChange={e => {
                                setIdentity(e.target.value);
                                // Reset additional fields when identity changes
                                setDepartment('');
                                setClassname('');
                            }}
                            required
                        >
                            <option value="admin">Admin</option>
                            <option value="student">Student</option>
                            <option value="ta">TA</option>
                        </select>
                    </div>

                    {identity === 'student' && (
                        <>
                            <div className="form-group">
                                <input
                                    type="text"
                                    value={department}
                                    onChange={e => setDepartment(e.target.value)}
                                    required
                                    placeholder="Department"
                                />
                            </div>
                            <div className="form-group">
                                <input
                                    type="text"
                                    value={classname}
                                    onChange={e => setClassname(e.target.value)}
                                    required
                                    placeholder="Class Name"
                                />
                            </div>
                        </>
                    )}

                    <div className="button-group">
                        <button className="submit-button" onClick={handleRegister}>Submit</button>
                        <button className="back-button" onClick={() => navigateTo('/admin/root')}>Back</button>
                    </div>
                </div>
            </main>
        </div>
    );
}
