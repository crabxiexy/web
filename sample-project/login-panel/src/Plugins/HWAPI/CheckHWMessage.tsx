import { HWMessage } from 'Plugins/HWAPI/HWMessage';

export class CheckHWMessage extends HWMessage {

    HW_id: number;
    is_checked: number;
    response: string;

    constructor(HW_id: number,
    is_checked: number,
    response: string,) {
        super();
        this.HW_id = HW_id;
        this.is_checked = is_checked;
        this.response = response;
    }
}