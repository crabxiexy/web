import { NotificationMessage } from 'Plugins/NotificationAPI/NotificationMessage';

export class DeleteNotificationMessage extends NotificationMessage {
    notificationId: number;


    constructor(notificationId: number) {
        super();
        this.notificationId = notificationId;

    }
}