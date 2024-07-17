import { ActivityMessage } from 'Plugins/ActivityAPI/ActivityMessage';

export class SubmitHWMessage extends ActivityMessage {

    activity_id : number;
    student_id :number;
    TA_id:number;
    submitTime:number;
    imgUrl:string;
    constructor(activity_id : number,
    student_id :number,
    TA_id:number,
    submitTime:number,
    imgUrl:string,
    ) {
        super();
        this.activity_id = activity_id;
        this.student_id = student_id;
        this.TA_id = TA_id;
        this.submitTime = submitTime;
        this.imgUrl = imgUrl;
    }
}
