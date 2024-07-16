import { HWMessage } from 'Plugins/HWAPI/HWMessage';

export class StudentQueryHWMessage extends HWMessage {

    student_id: number;

    constructor(student_id: number) {
        super();
        this.student_id = student_id;
    }
}