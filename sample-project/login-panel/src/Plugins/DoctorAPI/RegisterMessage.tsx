import { DoctorMessage } from 'Plugins/DoctorAPI/DoctorMessage'

export class RegisterMessage extends DoctorMessage {
    student_id:number;
    name: string;
    password: string;
    identity: number;
    constructor(student_id:number,name: string, password: string, identity:number) {
        super();
        this.student_id = student_id;
        this.name = name;
        this.password = password;
        this.identity = identity;

    }
}