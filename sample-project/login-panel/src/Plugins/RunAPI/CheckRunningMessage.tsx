import { RunMessage } from 'Plugins/RunAPI/RunMessage'

export class CheckRunningMessage extends RunMessage {
    run_id: number;
    is_checked: number;
    response:String;


    constructor(
        run_id: number,
        is_checked: number,
        response: string
    ) {
        super();
        this.run_id = run_id;
        this.is_checked = is_checked;
        this.response = response;
    }
}