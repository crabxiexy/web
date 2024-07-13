
import { GroupexMessage } from 'Plugins/GroupExAPI/GroupexMessage';

export class SignoutMessage extends GroupexMessage {
    student_id: number;
    groupex_id: number;
    token:string;


    constructor(student_id: number, groupex_id: number, token: string) {
        super();
        this.student_id = student_id;
        this.groupex_id = groupex_id;
        this.token = token;
    }
}