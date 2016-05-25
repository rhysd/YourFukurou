import Timeline from './timeline';

export default class Message {
    constructor(public client: WebdriverIO.Client<void>) {
    }

    ensureInfoMessage() {
        return this.client.waitForExist('.message__body.message__body_info', 5000);
    }

    ensureErrorMessage() {
        return this.client.waitForExist('.message__body.message__body_error', 5000);
    }

    async waitForMessageDismissed() {
        await this.client.waitForExist('.message__body', 10000, true);
        return new Timeline(this.client);
    }
}
