import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {JhiTrackerService, WebchatSharedModule} from '../shared';
import {ChatComponent} from './chat/chat.component';
import { RouterModule } from '@angular/router';
import {webchatState} from './webchat.route';

/* jhipster-needle-add-admin-module-import - JHipster will add admin modules imports here */
@NgModule({
    imports: [
        WebchatSharedModule,
        RouterModule.forChild(webchatState),

        /* jhipster-needle-add-admin-module - JHipster will add admin modules here */
    ],
    declarations: [
        ChatComponent
    ],
    providers: [
        JhiTrackerService,

],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class WebchatModule  {}
