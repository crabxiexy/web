import { RunMessage } from 'Plugins/RunAPI/RunMessage'

export class StudentQueryRunningMessage extends RunMessage {
    student_id: number;


    constructor(
        student_id: number
    ) {
        super();
        this.student_id=student_id;
    }
}