import { DoctorMessage } from 'Plugins/DoctorAPI/DoctorMessage'

export class RegisterMessage extends DoctorMessage {
    student_id:number;
    name: string;
    password: string;
    identity: number;
    profile:string;
    department:string;
    class_name:string;
    constructor(student_id:number,name: string, password: string, identity:number,profile:string,department:string,class_name:string) {
        super();
        this.student_id = student_id;
        this.name = name;
        this.password = password;
        this.identity = identity;
        this.profile = profile;
        this.class_name = class_name;
        this.department=department

    }
}