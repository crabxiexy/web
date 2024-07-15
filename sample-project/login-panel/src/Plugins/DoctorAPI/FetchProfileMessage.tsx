import { DoctorMessage } from 'Plugins/DoctorAPI/DoctorMessage'

export class FetchProfileMessage extends DoctorMessage {
    studentId: number;
    constructor(studentId:number) {
        super();
        this.studentId = studentId;
    }
}