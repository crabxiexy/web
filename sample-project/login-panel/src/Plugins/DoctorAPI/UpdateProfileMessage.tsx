import { DoctorMessage } from 'Plugins/DoctorAPI/DoctorMessage'

export class UpdateProfileMessage extends DoctorMessage {
    student_id:number;
    profile:string;

    constructor(student_id:number,profile:string) {
        super();
        this.student_id = student_id;
        this.profile = profile;
    }
}