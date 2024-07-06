import { DoctorMessage } from 'Plugins/DoctorAPI/DoctorMessage'

export class RenameMessage extends DoctorMessage {
    old_password: string;
    new_password: string;
    student_id:number;

    constructor(student_id:number,old_password:string,new_password:string) {
        super();
        this.student_id = student_id;
        this.old_password = old_password;
        this.new_password = new_password;
    }
}