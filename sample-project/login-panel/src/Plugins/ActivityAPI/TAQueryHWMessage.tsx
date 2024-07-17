import { ActivityMessage } from 'Plugins/ActivityAPI/ActivityMessage';

export class TAQueryHWMessage extends ActivityMessage {
    TA_id:number;
    constructor(
        TA_id:number,
    ) {
        super();
        this.TA_id = TA_id;
    }
}
