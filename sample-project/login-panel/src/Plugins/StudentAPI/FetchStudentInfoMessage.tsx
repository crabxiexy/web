import { StudentMessage } from 'Plugins/StudentAPI/StudentMessage'

export class FetchStudentInfoMessage extends StudentMessage {
    student_id: number;
    constructor(student_id:number) {
        super();
        this.student_id = student_id;
    }
}

