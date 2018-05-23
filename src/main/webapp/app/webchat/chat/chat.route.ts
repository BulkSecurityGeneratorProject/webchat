import { Route } from '@angular/router';
import {ChatComponent} from './chat.component';

export const chatRoute: Route = {
    path: 'chat',
    component: ChatComponent,
    data: {
        pageTitle: 'health.title'
    }
};
