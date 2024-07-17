import { ActivityMessage } from 'Plugins/ActivityAPI/ActivityMessage';

export class QueryMemberMessage extends ActivityMessage {
    activity_id: number;


    constructor(club_name:number) {
        super();
        this.activity_id = club_name;

    }
}