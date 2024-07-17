import { ActivityMessage } from 'Plugins/ActivityAPI/ActivityMessage';

export class CheckHWMessage extends ActivityMessage {
    activity_id: number;
    is_checked: number;
    response: string;
    constructor(
        activity_id: number,
        is_checked: number,
        response: string
    ) {
        super();
        this.activity_id = activity_id;
        this.is_checked = is_checked;
        this.response = response;
    }
}
