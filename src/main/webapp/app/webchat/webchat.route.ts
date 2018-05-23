import { Routes } from '@angular/router';

import { UserRouteAccessService } from '../shared';
import {chatRoute} from './chat/chat.route';

const AUTHENTICATED = [
    chatRoute
];

export const webchatState: Routes = [{
    path: 'webchat',
    data: {
        authorities: ['ROLE_ADMIN', 'ROLE_USER']
    },
    canActivate: [UserRouteAccessService],
    children: AUTHENTICATED
}];
