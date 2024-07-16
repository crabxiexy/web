import { ActivityMessage } from 'Plugins/ActivityAPI/ActivityMessage';

export class JoinActivityMessage extends ActivityMessage {

    member_id: number;
    activity_id: number;

    constructor(member_id: number, activity_id: number) {
        super();
        this.member_id = member_id;
        this.activity_id = activity_id;
    }
}
