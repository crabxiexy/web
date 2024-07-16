import { ClubMessage } from 'Plugins/ClubAPI/ClubMessage';

export class QueryApplyMessage extends ClubMessage {
    clubName: string;


    constructor(clubName: string) {
        super();
        this.clubName = clubName;
    }
}