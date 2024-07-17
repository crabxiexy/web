import { StudentMessage } from 'Plugins/StudentAPI/StudentMessage'

export class AssignScoreMessage extends StudentMessage {
    student_id: number;
   score: number;

    constructor(student_id:number, score:number) {
        super();
        this.student_id = student_id;
        this.score = score;
    }
}

