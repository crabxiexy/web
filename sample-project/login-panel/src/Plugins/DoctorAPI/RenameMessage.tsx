import { DoctorMessage } from 'Plugins/DoctorAPI/DoctorMessage'

export class RenameMessage extends DoctorMessage {
    userName: string;
    password: string;
    id:number;

    constructor(userName: string, password: string, id: number) {
        super();
        this.userName = userName;
        this.password = password;
        this.id=id
    }
}