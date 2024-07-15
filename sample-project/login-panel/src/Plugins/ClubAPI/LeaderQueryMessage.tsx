import { ClubMessage } from 'Plugins/ClubAPI/ClubMessage';

export class LeaderQueryMessage extends ClubMessage {
    leader_id: number;


    constructor( leader_id:number) {
        super();
        this.leader_id = leader_id;
    }
}
