import { ClubMessage } from 'Plugins/ClubAPI/ClubMessage';

export class CheckJointClubMessage extends ClubMessage {
    studentId: number;


    constructor(studentId: number) {
        super();
        this.studentId = studentId;
    }
}
