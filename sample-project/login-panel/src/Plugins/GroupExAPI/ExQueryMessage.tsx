import { GroupexMessage } from 'Plugins/GroupExAPI/GroupexMessage';

export class ExQueryMessage extends GroupexMessage {
    groupex_id: number;
    in_out: number; // 1 for sign_in, 2 for both, or another value for sign_out

    constructor(groupex_id: number, in_out: number) {
        super();
        this.groupex_id = groupex_id;
        this.in_out = in_out;
    }
}