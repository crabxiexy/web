import { NotificationMessage } from 'Plugins/NotificationAPI/NotificationMessage';

export class QuerySentMessage extends NotificationMessage {
    sender_id: number;


    constructor(receiver_id: number) {
        super();
        this.sender_id = receiver_id;

    }
}