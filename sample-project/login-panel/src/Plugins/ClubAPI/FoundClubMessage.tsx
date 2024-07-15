import { ClubMessage } from 'Plugins/ClubAPI/ClubMessage';

export class FoundClubMessage extends ClubMessage {
    club_name:String
    leader_id: number;
    club_intro: string;
    club_depart:string;


    constructor(club_name:String, leader_id:number, club_intro:string,club_depart:string) {
        super();
        this.club_name = club_name;
        this.leader_id = leader_id;
        this.club_intro = club_intro;
        this.club_depart = club_depart;
    }
}
