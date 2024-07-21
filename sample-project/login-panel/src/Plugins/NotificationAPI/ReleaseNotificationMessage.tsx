
import { NotificationMessage } from 'Plugins/NotificationAPI/NotificationMessage';
    export class ReleaseNotificationMessage extends NotificationMessage {
        senderId: number;
        receiverId:number;
        content: string;
            constructor(senderId:number,receiverId:number,content:string){
        super();
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.content = content;
    }
}