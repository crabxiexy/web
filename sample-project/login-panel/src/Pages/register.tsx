import React, { useState } from 'react';
import { RegisterMessage } from 'Plugins/DoctorAPI/RegisterMessage';
import { AssignDepartmentMessage } from 'Plugins/StudentAPI/AssignDepartmentMessage';
import { AssignClassMessage } from 'Plugins/StudentAPI/AssignClassMessage';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import { useHistory } from 'react-router';
import './register.css';

interface Student {
    student_id: string;
    name: string;
    password: string;
    department: string;
    classname: string;
}

export function Register() {
    const history = useHistory();
    const [students, setStudents] = useState<Student[]>([
        { student_id: '', name: '', password: '', department: '', classname: '' }
    ]);
    const [error, setError] = useState<string>('');

    // State for bulk inputs
    const [bulkDepartment, setBulkDepartment] = useState<string>('');
    const [bulkClassname, setBulkClassname] = useState<string>('');
    const [bulkPassword, setBulkPassword] = useState<string>('');

    // Identity selection
    const [identity, setIdentity] = useState('student');
    const identityMap: Record<string, number> = {
        admin: 1,
        student: 2,
        ta: 3,
    };

    const addStudentField = () => {
        setStudents([...students, { student_id: '', name: '', password: '', department: '', classname: '' }]);
    };

    const handleChange = (index: number, field: keyof Student, value: string) => {
        const updatedStudents = [...students];
        updatedStudents[index][field] = value;
        setStudents(updatedStudents);
    };

    const handleBulkUpdate = (field: keyof Student, value: string) => {
        const updatedStudents = students.map(student => ({
            ...student,
            [field]: value,
        }));
        setStudents(updatedStudents);
    };

    const handleRegister = async () => {
        try {
            for (const student of students) {
                const { student_id, name, password, department, classname } = student;
                const identityNumber = identityMap[identity];
                const message = new RegisterMessage(
                    parseInt(student_id),
                    name,
                    password,
                    identityNumber,
                    "http://183.172.236.220:9005/proof/test.jpg"
                );
                const response = await sendPostRequest(message);

                if (response.status === 200) {
                    if (identity === 'student') {
                        const assignDepartmentMessage = new AssignDepartmentMessage(parseInt(student_id), department);
                        const assignClassMessage = new AssignClassMessage(parseInt(student_id), classname);
                        await sendPostRequest(assignDepartmentMessage);
                        await sendPostRequest(assignClassMessage);
                    }
                } else {
                    setError(`Error registering student ID ${student_id}: ${response.data}`);
                    return;
                }
            }
            history.push('/admin/root'); // Redirect after successful registration
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="register-container">
            <header className="register-header">
                <div className="logo" onClick={() => history.push('/home')}>MyApp</div>
                <nav>
                    <ul>
                        <li onClick={() => history.push('/')}>Home</li>
                    </ul>
                </nav>
            </header>
            <main className="main-content">
                <div className="form-container">
                    <h2>Batch Register Users</h2>
                    {error && <p className="error-message">{error}</p>}

                    {/* Identity selection */}
                    <div className="form-group">
                        <select
                            value={identity}
                            onChange={e => {
                                setIdentity(e.target.value);
                                // Reset additional fields when identity changes
                                setBulkDepartment('');
                                setBulkClassname('');
                                setBulkPassword('');
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
                            {/* Bulk input fields for students only */}
                            <div className="bulk-inputs">
                                <input
                                    type="text"
                                    value={bulkDepartment}
                                    onChange={e => setBulkDepartment(e.target.value)}
                                    placeholder="Set Department for All"
                                />
                                <button onClick={() => handleBulkUpdate('department', bulkDepartment)}>Apply to All</button>

                                <input
                                    type="text"
                                    value={bulkClassname}
                                    onChange={e => setBulkClassname(e.target.value)}
                                    placeholder="Set Class Name for All"
                                />
                                <button onClick={() => handleBulkUpdate('classname', bulkClassname)}>Apply to All</button>

                                <input
                                    type="password"
                                    value={bulkPassword}
                                    onChange={e => setBulkPassword(e.target.value)}
                                    placeholder="Set Password for All"
                                />
                                <button onClick={() => handleBulkUpdate('password', bulkPassword)}>Apply to All</button>
                            </div>
                        </>
                    )}

                    {students.map((student, index) => (
                        <div key={index} className="student-form">
                            <input
                                type="number"
                                value={student.student_id}
                                onChange={e => handleChange(index, 'student_id', e.target.value)}
                                required
                                placeholder="Student ID"
                            />
                            <input
                                type="text"
                                value={student.name}
                                onChange={e => handleChange(index, 'name', e.target.value)}
                                required
                                placeholder="Username"
                            />
                            <input
                                type="password"
                                value={student.password}
                                onChange={e => handleChange(index, 'password', e.target.value)}
                                required
                                placeholder="Password"
                            />
                            {identity === 'student' && (
                                <>
                                    <input
                                        type="text"
                                        value={student.department}
                                        onChange={e => handleChange(index, 'department', e.target.value)}
                                        required
                                        placeholder="Department"
                                    />
                                    <input
                                        type="text"
                                        value={student.classname}
                                        onChange={e => handleChange(index, 'classname', e.target.value)}
                                        required
                                        placeholder="Class Name"
                                    />
                                </>
                            )}
                        </div>
                    ))}
                    <div className="button-group">
                        <button className="add-student-button" onClick={addStudentField}>Add Student</button>
                        <button className="submit-button" onClick={handleRegister}>Submit All</button>
                        <button className="back-button" onClick={() => history.push('/admin/root')}>Back</button>
                    </div>
                </div>
            </main>
        </div>
    );
}
