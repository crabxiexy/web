import { ActivityMessage } from 'Plugins/ActivityAPI/ActivityMessage';

export class ShowActivityMessage extends ActivityMessage {
    club_name: string;


    constructor(club_name: string) {
        super();
        this.club_name = club_name;

    }
}