"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _1 = require("./");
var shared_1 = require("../shared");
var ADMIN_ROUTES = [
    _1.chatRoute
];
exports.adminState = [{
        path: '',
        data: {
            authorities: ['ROLE_ADMIN']
        },
        canActivate: [shared_1.UserRouteAccessService],
        children: ADMIN_ROUTES
    }].concat(userDialogRoute);
