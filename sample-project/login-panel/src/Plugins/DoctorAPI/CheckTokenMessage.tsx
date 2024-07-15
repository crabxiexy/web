import { DoctorMessage } from 'Plugins/DoctorAPI/DoctorMessage'

export class CheckTokenMessage extends DoctorMessage {
    studentId: number;
    token: string;

    constructor(studentId:number, token: string) {
        super();
        this.studentId = studentId;
        this.token = token;
    }
}