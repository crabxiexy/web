import { GroupexMessage } from 'Plugins/GroupExAPI/GroupexMessage';

export class CountGroupexMessage extends GroupexMessage {
    student_id: number;

    constructor(
        student_id: number
    ) {
        super();
        this.student_id=student_id;
    }
}