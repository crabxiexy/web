import { DoctorMessage } from 'Plugins/DoctorAPI/DoctorMessage'

export class FetchNameMessage extends DoctorMessage {
    studentId: number;
    constructor(studentId:number) {
        super();
        this.studentId = studentId;
    }
}