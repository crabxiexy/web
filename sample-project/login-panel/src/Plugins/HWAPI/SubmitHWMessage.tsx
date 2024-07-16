import { HWMessage } from 'Plugins/HWAPI/HWMessage';

export class SubmitHWMessage extends HWMessage {

    startTime:string;
    finishTime:string;
    HW_name:string;
    student_id:number;
    leader_id:number;
    club_name:string;
    imgUrl:string;

    constructor(startTime:string,
    finishTime:string,
    HW_name:string,
    student_id:number,
    leader_id:number,
    club_name:string,
    imgUrl:string) {
        super();
        this.startTime = startTime;
        this.finishTime = finishTime;
        this.HW_name = HW_name;
        this.student_id = student_id;
        this.leader_id = leader_id;
        this.club_name = club_name;
        this.imgUrl = imgUrl;
    }
}