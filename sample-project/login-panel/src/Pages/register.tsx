import React, { useState } from 'react';
import { RegisterMessage } from 'Plugins/DoctorAPI/RegisterMessage';
import { AssignDepartmentMessage } from 'Plugins/StudentAPI/AssignDepartmentMessage';
import { AssignClassMessage } from 'Plugins/StudentAPI/AssignClassMessage';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import { useHistory } from 'react-router';
import register_style from './register.module.css';

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
        <div className={register_style.register_container}>
            <header className={register_style.register_header}>
                <div className={register_style.logo} onClick={() => history.push('/home')}>乐动力Pro</div>
                <nav>
                    <ul>
                        <li onClick={() => history.push('/')}>回到主页</li>
                    </ul>
                </nav>
            </header>
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
                                setBulkDepartment('');
                                setBulkClassname('');
                                setBulkPassword('');
                            }}
                            required
                        >
                            <option value="admin">管理员</option>
                            <option value="student">学生</option>
                            <option value="ta">助教</option>
                        </select>
                    </div>

                    {/* Your existing JSX code here */}
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
                                        value={student.classname}
                                        onChange={e => handleChange(index, 'classname', e.target.value)}
                                        required
                                        placeholder="班级号"
                                    />
                                </>
                            )}
                        </div>
                    ))}
                    <div className={register_style.button_group}>
                        <button className={register_style.add_student_button} onClick={addStudentField}>添加用户</button>
                        <button className={register_style.submit_button} onClick={handleRegister}>全部提交</button>
                        <button className={register_style.back_button} onClick={() => history.push('/admin/root')}>返回主页</button>
                    </div>
                </div>
            </main>
        </div>
    );
}
