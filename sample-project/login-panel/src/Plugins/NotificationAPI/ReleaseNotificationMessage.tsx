
import { NotificationMessage } from 'Plugins/NotificationAPI/NotificationMessage';
    export class ReleaseNotificationMessage extends NotificationMessage {
        releaserName: string;
        senderId: number;
        receiverId:number;
        content: string;
            constructor(releaserName:string,senderId:number,receiverId:number,content:string){
        super();
        this.releaserName = releaserName;
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.content = content;
    }
}