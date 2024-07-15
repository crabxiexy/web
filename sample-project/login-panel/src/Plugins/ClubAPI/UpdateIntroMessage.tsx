import { ClubMessage } from 'Plugins/ClubAPI/ClubMessage';

export class ReplyAppMessage extends ClubMessage {
    club_name: string;
    new_intro: string

    constructor(club_name: string, new_intro: string) {
        super();
        this.club_name = club_name;
        this.new_intro= new_intro;
    }
}