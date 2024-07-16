import { StudentMessage } from 'Plugins/StudentAPI/StudentMessage'

export class TAQueryMessage extends StudentMessage {
    TAId: number;

    constructor(TAId:number) {
        super();
        this.TAId = TAId;
    }
}

