import { ActivityMessage } from 'Plugins/ActivityAPI/ActivityMessage';

export class CreateActivityMessage extends ActivityMessage {

    club_name: string;
    activity_name: string;
    intro : string;
    startTime : string;
    finishTime : string;
    organizor_id : number;
    lowLimit : number;
    upLimit : number;
    num : number


    constructor(club_name: string, activity_name: string, intro : string, startTime : string, finishTime : string, organizor_id : number, lowLimit : number, upLimit : number, num : number) {
        super();
        this.club_name = club_name;
        this.activity_name = activity_name;
        this.intro = intro;
        this.startTime = startTime;
        this.finishTime = finishTime;
        this.organizor_id = organizor_id;
        this.activity_name = activity_name;
        this.lowLimit = lowLimit;
        this.upLimit = upLimit;
        this.num = num;
    }
}
