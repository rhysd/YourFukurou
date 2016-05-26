import Timeline from './timeline';
import Message from './message';

export default class Editor {
    constructor(public client: WebdriverIO.Client<void>) {
    }

    async inputKeys(keys: string | string[]) {
        return this.client.keys(keys);
    }

    async sendButtonIsInactive() {
        return this.client.waitForExist('.tweet-form__send-btn.tweet-form__send-btn_inactive', 1000);
    }

    async sendButtonIsActive() {
        return this.client.waitForExist('.tweet-form__send-btn.tweet-form__send-btn_active', 1000);
    }

    async sendTweet() {
        await this.client.click('.tweet-form__send-btn.tweet-form__send-btn_active');
        return new Message(this.client);
    }

    async cancelTweet() {
        await this.client.click('.tweet-form__cancel-btn');
        return new Timeline(this.client);
    }
}
