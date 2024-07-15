import { StudentMessage } from 'Plugins/StudentAPI/StudentMessage'

export class AssignClassMessage extends StudentMessage {
    student_id: number;
    classname: string;

    constructor(student_id:number, classname: string) {
        super();
        this.student_id = student_id;
        this.classname = classname;
    }
}

