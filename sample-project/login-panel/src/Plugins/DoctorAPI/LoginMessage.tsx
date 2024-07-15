import { DoctorMessage } from 'Plugins/DoctorAPI/DoctorMessage'

export class LoginMessage extends DoctorMessage {
    studentId: number;
    password: string;
    identity:number;
    constructor(studentId:number, password: string,identity:number) {
        super();
        this.studentId = studentId;
        this.password = password;
        this.identity = identity;
    }
}