import { ClubMessage } from 'Plugins/ClubAPI/ClubMessage';

export class QueryMemberMessage extends ClubMessage {
    club_name: string;

    constructor(club_name: string) {
        super();
        this.club_name = club_name;
    }
}