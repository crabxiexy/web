import { StudentMessage } from 'Plugins/StudentAPI/StudentMessage'

export class AssignDepartmentMessage extends StudentMessage {
    student_id: number;
    department: string;

    constructor(student_id:number, department: string) {
        super();
        this.student_id = student_id;
        this.department = department;
    }
}

