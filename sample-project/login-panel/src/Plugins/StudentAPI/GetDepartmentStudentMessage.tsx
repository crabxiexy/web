import { StudentMessage } from 'Plugins/StudentAPI/StudentMessage'

export class GetDepartmentStudentMessage extends StudentMessage {
    department: string;
    constructor(department: string) {
        super();
        this.department = department;
    }
}