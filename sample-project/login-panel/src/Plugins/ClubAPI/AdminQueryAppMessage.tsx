import { ClubMessage } from 'Plugins/ClubAPI/ClubMessage';

export class AdminQueryAppMessage extends ClubMessage {
    is_checked: number;

    constructor(is_checked: number) {
        super();
        this.is_checked = is_checked;
    }
}