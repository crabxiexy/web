import { ClubMessage } from 'Plugins/ClubAPI/ClubMessage';

export class AddMemberMessage extends ClubMessage {
    club_name: string;
    member_id:number

    constructor(club_name: string, member_id:number) {
        super();
        this.club_name = club_name;
        this.member_id = member_id;
    }
}