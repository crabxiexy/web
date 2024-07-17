import { ActivityMessage } from 'Plugins/ActivityAPI/ActivityMessage';

export class CountHWMessage extends ActivityMessage {
    student_id: number;

    constructor(student_id: number) {
        super();
        this.student_id = student_id;
    }
}
