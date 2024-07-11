import { RunMessage } from 'Plugins/RunAPI/RunMessage'

export class TAQueryRunningMessage extends RunMessage {
    ta_id: number;


    constructor(
        ta_id: number

    ) {
        super();
        this.ta_id=ta_id;
    }
}