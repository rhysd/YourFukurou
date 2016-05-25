import Timeline from './timeline';

export default class Message {
    constructor(public client: WebdriverIO.Client<void>) {
    }

    ensureInfoMessage() {
        return this.client.waitForExist('.message__body.message__body_info', 5000);
    }

    async waitForMessageDismissed() {
        await this.client.waitForExist('.message__body.message__body_info', 10000, true);
        return new Timeline(this.client);
    }
}
