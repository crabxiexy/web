import { GroupexMessage } from 'Plugins/GroupExAPI/GroupexMessage';

export class StudentQueryMessage extends GroupexMessage {
    TA_id: number;

    constructor(TA_id: number) {
        super();
        this.TA_id = TA_id;
    }
}