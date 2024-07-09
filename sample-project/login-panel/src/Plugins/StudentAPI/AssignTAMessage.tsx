import { StudentMessage } from 'Plugins/StudentAPI/StudentMessage'

export class AssignTAMessage extends StudentMessage {
    student_id: number;
    TA_id: number;

    constructor(student_id:number, TA_id: number) {
        super();
        this.student_id = student_id;
        this.TA_id = TA_id;
    }
}
