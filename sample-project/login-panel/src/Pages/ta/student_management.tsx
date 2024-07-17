import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import { AssignTAMessage } from 'Plugins/StudentAPI/AssignTAMessage';
import { CheckTokenMessage } from 'Plugins/DoctorAPI/CheckTokenMessage';
import { GetStudentMessage } from 'Plugins/StudentAPI/GetStudentMessage';
import { FetchNameMessage } from 'Plugins/DoctorAPI/FetchNameMessage';
import { TAQueryMessage } from 'Plugins/StudentAPI/TAQueryMessage';
import useIdStore from 'Pages/IdStore';
import useTokenStore from 'Pages/TokenStore';
import './student_management.css';

// Define the Student type
interface Student {
    studentID: number;
    department: string;
    class: string;
    name?: string; // Optional, since it may not be fetched
}

export const AssignTA: React.FC = () => {
    const history = useHistory();
    const { Id } = useIdStore();
    const token = useTokenStore(state => state.Token);
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<Set<number>>(new Set());
    const [error, setError] = useState<string>('');
    const [username, setUsername] = useState<string>('Guest');
    const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
    const [taData, setTaData] = useState<any[]>([]); // State for TA data

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            setUsername(storedUsername);
        }
        fetchStudents(); // Fetch students on component mount
        fetchTAData(); // Fetch TA data on component mount
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await sendPostRequest(new GetStudentMessage());
            const studentsData: Student[] = await Promise.all(
                response.data.map(async (student: Student) => {
                    // Fetch name but ignore errors
                    try {
                        const nameResponse = await sendPostRequest(new FetchNameMessage(student.studentID));
                        return {
                            ...student,
                            name: nameResponse.data // Add name to student object
                        };
                    } catch {
                        return {
                            ...student,
                            name: undefined // Set as undefined if there's an error
                        };
                    }
                })
            );
            setStudents(studentsData);
        } catch {
            setError('Failed to load student information.');
        }
    };

    const fetchTAData = async () => {
        try {
            const taIdNumber = parseInt(Id);
            const taQueryMessage = new TAQueryMessage(taIdNumber);
            const taResponse = await sendPostRequest(taQueryMessage); // Trigger TA query
            const taDataWithNames = await Promise.all(
                taResponse.data.map(async (ta: any) => {
                    // Fetch name for each TA student
                    try {
                        const nameResponse = await sendPostRequest(new FetchNameMessage(ta.studentID));
                        return {
                            ...ta,
                            name: nameResponse.data // Add name to TA data
                        };
                    } catch {
                        return {
                            ...ta,
                            name: undefined // Set as undefined if there's an error
                        };
                    }
                })
            );
            setTaData(taDataWithNames); // Set TA data with names
        } catch {
            setError('Failed to load TA information.');
        }
    };

    const handleSelectStudent = (studentId: number) => {
        setSelectedStudents(prev => {
            const updated = new Set(prev);
            if (updated.has(studentId)) {
                updated.delete(studentId);
            } else {
                updated.add(studentId);
            }
            return updated;
        });
    };

    const handleAssignTA = async () => {
        try {
            const taIdNumber = parseInt(Id);
            const checkTokenMessage = new CheckTokenMessage(taIdNumber, token);
            const tokenResponse = await sendPostRequest(checkTokenMessage);

            if (tokenResponse.data === "Token is valid.") {
                for (const studentId of selectedStudents) {
                    const assignTAMessage = new AssignTAMessage(studentId, taIdNumber);
                    await sendPostRequest(assignTAMessage);
                }
                history.push('/ta_dashboard');
            } else {
                setError("Token is invalid or expired.");
                history.push("/login");
            }
        } catch {
            setError('Assigning TA failed. Please try again.');
        }
    };

    const toggleDropdown = () => setDropdownVisible(!dropdownVisible);
    const goBack = () => history.goBack();

    return (
        <div className="App">
            <header className="App-header">
                <h1>Assign TA</h1>
                <div className="user-section">
                    <div className="user-avatar" onClick={toggleDropdown}>{username}</div>
                    {dropdownVisible && (
                        <div className="dropdown-menu">
                            <p>Profile</p>
                            <p>Help</p>
                        </div>
                    )}
                </div>
            </header>
            <main>
                {error && <p className="error-message">{error}</p>}
                <div className="form-container">
                    <button className="btn back-btn" onClick={goBack}>Back</button>
                </div>
                <div className="students-list">
                    <h2>All Students</h2>
                    <table className="students-table">
                        <thead>
                        <tr>
                            <th>Select</th>
                            <th>ID</th>
                            {students.some(student => student.name) && <th>Name</th>}
                            <th>Department</th>
                            <th>Class</th>
                        </tr>
                        </thead>
                        <tbody>
                        {students.map((student) => (
                            <tr key={student.studentID}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedStudents.has(student.studentID)}
                                        onChange={() => handleSelectStudent(student.studentID)}
                                    />
                                </td>
                                <td>{student.studentID}</td>
                                {student.name && <td>{student.name}</td>}
                                <td>{student.department}</td>
                                <td>{student.class}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                <div className="ta-data">
                    <h2>TA Data</h2>
                    <table className="ta-table">
                        <thead>
                        <tr>
                            <th>Student ID</th>
                            <th>Name</th> {/* Added Name column */}
                            <th>Score</th>
                            <th>Department</th>
                            <th>Class</th>
                        </tr>
                        </thead>
                        <tbody>
                        {taData.map((ta) => (
                            <tr key={ta.studentID}>
                                <td>{ta.studentID}</td>
                                <td>{ta.name}</td> {/* Display name for each TA student */}
                                <td>{ta.score}</td>
                                <td>{ta.department}</td>
                                <td>{ta.class}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                <button className="btn assign-btn" onClick={handleAssignTA}>
                    Assign Selected TA
                </button>
            </main>
        </div>
    );
};
