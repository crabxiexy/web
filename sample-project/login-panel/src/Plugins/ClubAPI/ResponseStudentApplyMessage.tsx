import { ClubMessage } from 'Plugins/ClubAPI/ClubMessage';

export class ResponseStudentApplyMessage extends ClubMessage {
    clubName: string;
    studentId: number;
    result: number;

    constructor(club_name: string, studentId: number, result: number) {
        super();
        this.clubName = club_name;
        this.studentId = studentId;
        this.result = result;
    }
}
