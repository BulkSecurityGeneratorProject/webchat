import { Component, OnInit, OnDestroy } from '@angular/core';
import {JhiTrackerService, Principal} from '../../shared';
import {OnlineUser} from './model/onlineuser.model';
import {ChatMsg} from './model/chatmsg.model';
import { JhiAlertService } from 'ng-jhipster';

@Component({
    selector: 'jhi-chat-component',
    templateUrl: './chat.component.html'
})
export class ChatComponent implements OnInit, OnDestroy {

    chatMessages: ChatMsg[] = [];
    privateChatMessages: ChatMsg[] = [];
    onlineUsers: OnlineUser[] = [];
    message: string;
    privateMessage: string;
    account: Account;

    constructor(
        private chatService: JhiTrackerService,
        private principal: Principal,

    ) {
    }

    showChatMsg(chatMsg: ChatMsg) {
        this.chatMessages.push(chatMsg);
    }


    showPrivateChatMsg(chatMsg: ChatMsg) {
        this.privateChatMessages.push(chatMsg);
    }

    showOnlineUsers(onlineUsers: OnlineUser[]) {
        while (this.onlineUsers.length > 0){
            this.onlineUsers.pop();
        }
        while (onlineUsers.length > 0){
            this.onlineUsers.push(onlineUsers.pop());
        }
    }

    ngOnInit() {
        this.principal.identity().then((account) => {
            this.account = account;
        });
        this.chatService.receiveChatMsg().subscribe((chatData) => {
            if(this.isChatMsg(chatData)){
                console.log("ChatData:ChatMsg", chatData);
                this.showChatMsg(chatData);
            } else {
                console.log("ChatData:OnlineUser", chatData);
                this.showOnlineUsers(chatData)
            }

        });
        this.chatService.receiveUser().subscribe((userData) => {
            if(this.isChatMsg(userData)){
                console.log("userData:ChatMsg", userData);
                this.showPrivateChatMsg(userData);
            } else {
                console.log("userData:OnlineUser", userData);
                this.showOnlineUsers(userData)
            }
        });

    }

    ngOnDestroy() {

    }

    sendMessage(message:string){
        this.chatService.sendMessageToAll(message);
        this.message = "";
    }


    sendMessageToUser(toUser: OnlineUser, message:string){
        this.chatService.sendMessageToUser(toUser.username, message);
        this.privateMessage = "";
    }

    getOnlineUsers(){
        console.log('pressed online');
        this.chatService.getOnlineUsers();
    }

    isChatMsg(chatData: ChatMsg | OnlineUser): chatData is ChatMsg{
        return (<ChatMsg> chatData).payload !== undefined;
    }
}
