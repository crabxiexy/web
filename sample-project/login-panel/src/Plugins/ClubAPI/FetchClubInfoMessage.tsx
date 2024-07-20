import { ClubMessage } from 'Plugins/ClubAPI/ClubMessage';

export class FetchClubInfoMessage extends ClubMessage {
    club_name:String


    constructor(club_name:String) {
        super();
        this.club_name = club_name;
    }
}
