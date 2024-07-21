import React, { useState } from 'react';
import { useHistory } from 'react-router';
import { RegisterMessage } from 'Plugins/DoctorAPI/RegisterMessage';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import { validateToken } from 'Plugins/ValidateToken'; // Adjust the path as necessary
import useIdStore from 'Plugins/IdStore';
import useTokenStore from 'Plugins/TokenStore';
import register_style from './register.module.css';

// Define enum for identity mapping
enum Identity {
    admin = 1,
    student = 2,
    ta = 3,
}

export function Register() {
    const history = useHistory();
    const { Id } = useIdStore();
    const { Token } = useTokenStore();
    const [students, setStudents] = useState<{ student_id: string; name: string; password: string; department: string; class_name: string }[]>([
        { student_id: '', name: '', password: '', department: '', class_name: '' }
    ]);
    const [error, setError] = useState<string>('');

    // Identity selection
    const [identity, setIdentity] = useState('student');

    const addStudentField = () => {
        setStudents([...students, { student_id: '', name: '', password: '', department: '', class_name: '' }]);
    };

    const handleChange = (index: number, field: keyof typeof students[0], value: string) => {
        const updatedStudents = [...students];
        updatedStudents[index][field] = value;
        setStudents(updatedStudents);
    };

    const handleRegister = async () => {
        try {
            // Validate token
            const isValidToken = await validateToken(Id, Token);

            if (!isValidToken) {
                setError('Token is invalid. Please log in again.');
                history.push('/login'); // Redirect to login page
                return;
            }

            // Proceed with registration if token is valid
            for (const student of students) {
                const { student_id, name, password, department, class_name } = student;
                const identityNumber = Identity[identity as keyof typeof Identity]; // Convert string to enum number

                const message = new RegisterMessage(
                    parseInt(student_id),
                    name,
                    password,
                    identityNumber,
                    "http://127.0.0.1:5000/proof/test.jpg",
                    department,
                    class_name
                );

                const response = await sendPostRequest(message);

                if (response.status !== 200) {
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
        <div className={register_style.register_container}>
            <main className={register_style.main_content}>
                <div className={register_style.form_container}>
                    <h2>注册用户</h2>
                    {error && <p className={register_style.error_message}>{error}</p>}

                    {/* Identity selection */}
                    <div className={register_style.form_group}>
                        <select
                            value={identity}
                            onChange={e => {
                                setIdentity(e.target.value);
                                // Reset additional fields when identity changes
                                setStudents([{ student_id: '', name: '', password: '', department: '', class_name: '' }]);
                            }}
                            required
                        >
                            <option value="admin">管理员</option>
                            <option value="student">学生</option>
                            <option value="ta">TA</option>
                        </select>
                    </div>

                    {/* Student registration fields */}
                    {students.map((student, index) => (
                        <div key={index} className={register_style.student_form}>
                            <input
                                type="text"
                                value={student.student_id}
                                onChange={e => handleChange(index, 'student_id', e.target.value)}
                                required
                                placeholder="用户ID"
                            />
                            <input
                                type="text"
                                value={student.name}
                                onChange={e => handleChange(index, 'name', e.target.value)}
                                required
                                placeholder="用户名"
                            />
                            <input
                                type="password"
                                value={student.password}
                                onChange={e => handleChange(index, 'password', e.target.value)}
                                required
                                placeholder="密码"
                            />
                            {identity === 'student' && (
                                <>
                                    <input
                                        type="text"
                                        value={student.department}
                                        onChange={e => handleChange(index, 'department', e.target.value)}
                                        required
                                        placeholder="院系"
                                    />
                                    <input
                                        type="text"
                                        value={student.class_name}
                                        onChange={e => handleChange(index, 'class_name', e.target.value)}
                                        required
                                        placeholder="班级号"
                                    />
                                </>
                            )}
                        </div>
                    ))}
                    <div className={register_style.button_group}>
                        <button className={register_style.submit_button} onClick={handleRegister}>提交</button>
                        <button className={register_style.back_button} onClick={() => history.push('/admin/root')}>返回主页</button>
                    </div>
                </div>
            </main>
        </div>
    );
}
