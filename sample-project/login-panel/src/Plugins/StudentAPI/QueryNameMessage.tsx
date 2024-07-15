import { StudentMessage } from 'Plugins/StudentAPI/StudentMessage'

export class QueryNameMessage extends StudentMessage {
    studentId: number;

    constructor(studentId:number) {
        super();
        this.studentId = studentId;
    }
}

