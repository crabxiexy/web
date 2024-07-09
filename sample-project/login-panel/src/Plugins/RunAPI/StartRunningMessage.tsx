import { RunMessage } from 'Plugins/RunAPI/RunMessage'

export class SubmitRunningMessage extends RunMessage {
    student_id: number;
    startTime: Date;
    finishTime: Date;
    distance: Double;
    png: bytea;

    constructor(student_id:number) {
        super();
        this.student_id = student_id;

    }
}
