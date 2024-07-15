import { ClubMessage } from 'Plugins/ClubAPI/ClubMessage';

export class ReplyAppMessage extends ClubMessage {
    club_name: string;
    result: number;
    response: string;

    constructor(club_name: string, result: number, response: string) {
        super();
        this.club_name = club_name;
        this.result = result;
        this.response = response;
    }
}