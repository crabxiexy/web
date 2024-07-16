import { ClubMessage } from 'Plugins/ClubAPI/ClubMessage';

export class FetchInfoMessage extends ClubMessage {
    clubName:String


    constructor(clubName:String) {
        super();
        this.clubName = clubName;
    }
}
