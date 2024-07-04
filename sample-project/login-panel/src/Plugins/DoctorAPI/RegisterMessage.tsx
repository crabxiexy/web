import { DoctorMessage } from 'Plugins/DoctorAPI/DoctorMessage'

export class RegisterMessage extends DoctorMessage {
    userName: string;
    password: string;
    identity: string;
    constructor(userName: string, password: string, identity:string) {
        super();
        this.userName = userName;
        this.password = password;
        this.identity = identity;

    }
}