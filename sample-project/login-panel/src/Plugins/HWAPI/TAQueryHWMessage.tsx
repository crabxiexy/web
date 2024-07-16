import { HWMessage } from 'Plugins/HWAPI/HWMessage';

export class TAQueryHWMessage extends HWMessage {

    TA_id: number;

    constructor(TA_id: number) {
        super();
        this.TA_id = TA_id;
    }
}