import { GroupexMessage } from 'Plugins/GroupExAPI/GroupexMessage';

export class CreateGroupexMessage extends GroupexMessage {
    ex_name:String
    TA_id: number;
    startTime: string;
    finishTime: string;
    location: string;

    constructor(ex_name:string,TA_id: number, startTime: string, finishTime: string, location: string) {
        super();
        this.ex_name = ex_name;
        this.TA_id = TA_id;
        this.startTime = startTime;
        this.finishTime = finishTime;
        this.location = location;
    }
}