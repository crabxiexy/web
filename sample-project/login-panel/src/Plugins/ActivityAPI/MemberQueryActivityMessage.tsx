import { ActivityMessage } from 'Plugins/ActivityAPI/ActivityMessage';

export class MemberQueryActivityMessage extends ActivityMessage {

    member_id: number;
    club_name: string;
    currentTime: string;
    status1: number;
    status2: number;
    status3: number;

    constructor(member_id: number, club_name: string, currentTime: string, status1: number, status2: number, status3: number) {
        super();
        this.member_id = member_id;
        this.club_name = club_name;
        this.currentTime = currentTime;
        this.status1 = status1;
        this.status2 = status2;
        this.status3 = status3;
    }
}
