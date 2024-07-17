import { ClubMessage } from 'Plugins/ClubAPI/ClubMessage';

export class ReplyAppMessage extends ClubMessage {
    club_name: string;
    new_profile: string

    constructor(club_name: string, new_profile: string) {
        super();
        this.club_name = club_name;
        this.new_profile= new_profile;
    }
}