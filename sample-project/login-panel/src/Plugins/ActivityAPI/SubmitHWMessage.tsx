import { ActivityMessage } from 'Plugins/ActivityAPI/ActivityMessage';

export class SubmitHWMessage extends ActivityMessage {
    leader_id:number;
    activity_id : number;
    student_id :number
    imgUrl:string;
    constructor(leader_id:number,
        activity_id : number,
    student_id :number,
    imgUrl:string,
    ) {
        super();
        this.activity_id = activity_id;
        this.student_id = student_id;
        this.leader_id = leader_id;
        this.imgUrl = imgUrl;
    }
}
