import Timeline from './timeline';
import {DefaultTimeout} from '../helper/timeouts';

export default class Message {
    constructor(public client: WebdriverIO.Client<void>) {
    }

    ensureInfoMessage() {
        return this.client.waitForExist('.message__body.message__body_info', DefaultTimeout);
    }

    ensureErrorMessage() {
        return this.client.waitForExist('.message__body.message__body_error', DefaultTimeout);
    }

    async waitForMessageDismissed() {
        await this.client.waitForExist('.message__body', DefaultTimeout, true);
        return new Timeline(this.client);
    }
}
