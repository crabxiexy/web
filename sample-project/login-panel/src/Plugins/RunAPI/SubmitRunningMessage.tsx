import { RunMessage } from 'Plugins/RunAPI/RunMessage'

export class SubmitRunningMessage extends RunMessage {
    student_id: number;
    startTime: String;
    finishTime:String;
    distance: number;
    imgUrl: String;

    constructor(student_id: number, startTime: Date, finishTime: Date, distance: number, imgUrl: String) {
        super();
        this.student_id = student_id;
        this.startTime = startTime.toISOString();
        this.finishTime = finishTime.toISOString();
        this.distance = distance;
        this.imgUrl = imgUrl;
    }
}