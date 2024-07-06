import { DoctorMessage } from 'Plugins/DoctorAPI/DoctorMessage'

export class LoginMessage extends DoctorMessage {
    student_id: number;
    password: string;
    identity:number;
    constructor(student_id:number, password: string,identity:number) {
        super();
        this.student_id = student_id;
        this.password = password;
        this.identity = identity;
    }
}