import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Observable, Observer, Subscription } from 'rxjs/Rx';

import { CSRFService } from '../auth/csrf.service';
import { WindowRef } from './window.service';
import { AuthServerProvider } from '../auth/auth-jwt.service';

import * as SockJS from 'sockjs-client';
import * as Stomp from 'webstomp-client';

@Injectable()
export class JhiTrackerService {
    stompClient = null;
    subscriber = null;
    connection: Promise<any>;
    connectedPromise: any;
    listener: Observable<any>;
    listenerObserver: Observer<any>;
    alreadyConnectedOnce = false;
    private subscription: Subscription;

    //Websocket Chat variables
    chatSubscriber = null;
    chatListener: Observable<any>;
    chatListenerObserver: Observer<any>;


    //Websocket User variables
    userSubscriber = null;
    userListener: Observable<any>;
    userListenerObserver: Observer<any>;


    constructor(
        private router: Router,
        private authServerProvider: AuthServerProvider,
        private $window: WindowRef,
        // tslint:disable-next-line: no-unused-variable
        private csrfService: CSRFService
    ) {
        this.connection = this.createConnection();
        this.listener = this.createListener();
        this.chatListener = this.createChatListener();
        this.userListener = this.createUserListener();
    }

    connect() {
        if (this.connectedPromise === null) {
          this.connection = this.createConnection();
        }
        // building absolute path so that websocket doesn't fail when deploying with a context path
        const loc = this.$window.nativeWindow.location;
        let url;
        url = '//' + loc.host + loc.pathname + 'websocket';
        const authToken = this.authServerProvider.getToken();
        if (authToken) {
            url += '?access_token=' + authToken;
        }
        const socket = new SockJS(url);
        this.stompClient = Stomp.over(socket);
        const headers = {};
        this.stompClient.connect(headers, () => {
            this.connectedPromise('success');
            this.connectedPromise = null;
            this.sendActivity();
            if (!this.alreadyConnectedOnce) {
                this.subscription = this.router.events.subscribe((event) => {
                  if (event instanceof NavigationEnd) {
                    this.sendActivity();
                  }
                });
                this.alreadyConnectedOnce = true;
            }
        });
    }

    disconnect() {
        if (this.stompClient !== null) {
            this.stompClient.disconnect();
            this.stompClient = null;
        }
        if (this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = null;
        }
        this.alreadyConnectedOnce = false;
    }

    receive() {
        return this.listener;
    }

    receiveChatMsg() {
        return this.chatListener;
    }

    receiveUser() {
        return this.userListener;
    }

    sendActivity() {
        if (this.stompClient !== null && this.stompClient.connected) {
            this.stompClient.send(
                '/wsadmin/activity', // destination
                JSON.stringify({'page': this.router.routerState.snapshot.url}), // body
                {} // header
            );
        }
    }

    subscribe() {
        this.connection.then(() => {
            this.subscriber = this.stompClient.subscribe('/wsadmin/tracker', (data) => {
                this.listenerObserver.next(JSON.parse(data.body));
            });
        });
    }

    unsubscribe() {
        if (this.subscriber !== null) {
            this.subscriber.unsubscribe();
        }
        this.listener = this.createListener();
    }

    private createListener(): Observable<any> {
        return new Observable((observer) => {
            this.listenerObserver = observer;
        });
    }

    private createConnection(): Promise<any> {
        return new Promise((resolve, reject) => this.connectedPromise = resolve);
    }

    //Websocket
    private createChatListener(): Observable<any> {
        return new Observable((observer) => {
            this.chatListenerObserver = observer;
            this.subscribeChat();
        });
    }

    subscribeChat() {
        this.connection.then(() => {
            this.chatSubscriber = this.stompClient.subscribe('/ws/chat', (data) => {
                this.chatListenerObserver.next(JSON.parse(data.body));
            });
        });
    }

    unsubscribeChat() {
        if (this.subscriber !== null) {
            this.subscriber.unsubscribe();
        }
        this.chatListener = this.createChatListener();
    }

    //User Subscription
    private createUserListener(): Observable<any> {
        return new Observable((observer) => {
            this.userListenerObserver = observer;
            this.subscribeUser();
        });
    }

    subscribeUser() {
        this.connection.then(() => {
            this.userSubscriber = this.stompClient.subscribe('/user/ws/chat', (data) => {
                this.userListenerObserver.next(JSON.parse(data.body));
            })
            setTimeout(()=>{ this.getOnlineUsers() }, 1)
        });
    }

    unsubscribeUser() {
        if (this.userSubscriber !== null) {
            this.userSubscriber.unsubscribe();
        }
        this.userListener = this.createUserListener();
    }

    //Actions
    sendMessageToAll(msg: String) {
        if (this.stompClient !== null && this.stompClient.connected) {
            this.stompClient.send(
                '/ws/sendmessage', // destination
                JSON.stringify({'payload': msg}), // body
                {} // header
            );
        }
    }


    //Actions
    sendMessageToUser(toUser: string, payload:string) {
        if (this.stompClient !== null && this.stompClient.connected) {
            this.stompClient.send(
                '/ws/sendmessagetouser', // destination
                JSON.stringify({'toUser': toUser, 'payload': payload}), // body
                {} // header
            );
        }
    }

    getOnlineUsers() {
        if (this.stompClient !== null && this.stompClient.connected) {
            this.stompClient.send(
                '/ws/onlineusers'
            );
        }
    }

}
