import { GroupexMessage } from 'Plugins/GroupExAPI/GroupexMessage';

export class TASignMessage extends GroupexMessage {
    groupex_id:number;
    TA_id: number;
    status: number;
    token:string;

    constructor(groupex_id:number,TA_id: number,status:number,token:string) {
        super();
        this.groupex_id=groupex_id;
        this.TA_id = TA_id;
        this.status= status;
        this.token = token;


    }
}