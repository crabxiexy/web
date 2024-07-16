import { NotificationMessage } from 'Plugins/NotificationAPI/NotificationMessage';

export class QueryReceivedMessage extends NotificationMessage {
    receiverId: number;


    constructor(receiverId: number) {
        super();
        this.receiverId = receiverId;

    }
}