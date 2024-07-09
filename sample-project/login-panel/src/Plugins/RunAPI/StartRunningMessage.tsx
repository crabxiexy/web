import { RunMessage } from 'Plugins/RunAPI/RunMessage'

export class SubmitRunningMessage extends RunMessage {
    student_id: number;
    startTime: Date;
    finishTime: Date;
    distance: number;
    png: Uint8Array;

    constructor(student_id: number, startTime: Date, finishTime: Date, distance: number, png: Uint8Array) {
        super();
        this.student_id = student_id;
        this.startTime = startTime;
        this.finishTime = finishTime;
        this.distance = distance;
        this.png = png;
    }
}