import { DoctorMessage } from 'Plugins/DoctorAPI/DoctorMessage'

export class UpdateProfileMessage extends DoctorMessage {
    studentId:number;
    profile:string;

    constructor(studentId:number,profile:string) {
        super();
        this.studentId = studentId;
        this.profile = profile;
    }
}