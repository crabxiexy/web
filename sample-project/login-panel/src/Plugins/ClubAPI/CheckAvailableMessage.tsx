import { ClubMessage } from 'Plugins/ClubAPI/ClubMessage';

export class CheckAvailableMessage extends ClubMessage {
    studentId: number;


    constructor(studentId: number) {
        super();
        this.studentId = studentId;
    }
}
