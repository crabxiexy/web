import { ClubMessage } from 'Plugins/ClubAPI/ClubMessage';

export class ApplyMemberMessage extends ClubMessage {
    studentId: number;
    clubName: string

    constructor(studentId:number, clubName:string) {
        super();
        this.studentId = studentId;
        this.clubName = clubName;
    }
}