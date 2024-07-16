import { NotificationMessage } from 'Plugins/NotificationAPI/NotificationMessage';

export class CheckNotificationMessage extends NotificationMessage {
    notificationId: number;


    constructor(notificationId: number) {
        super();
        this.notificationId = notificationId;

    }
}