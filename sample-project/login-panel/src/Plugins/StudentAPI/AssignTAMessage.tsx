import { StudentMessage } from 'Plugins/StudentAPI/StudentMessage'

export class AssignTAMessage extends StudentMessage {
    student_id: number;
    ta_id: number;
    identity:number;
    constructor(student_id:number, ta_id: number) {
        super();
        this.student_id = student_id;
        this.ta_id = ta_id;
    }
}
