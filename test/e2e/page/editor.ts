import Timeline from './timeline';
import Message from './message';
import {DefaultTimeout} from '../helper/timeouts';

export default class Editor {
    constructor(public client: WebdriverIO.Client<void>) {
    }

    async inputKeys(keys: string | string[]) {
        return this.client.keys(keys);
    }

    async sendButtonIsInactive() {
        return this.client.waitForExist('.tweet-form__send-btn.tweet-form__send-btn_inactive', DefaultTimeout);
    }

    async sendButtonIsActive() {
        return this.client.waitForExist('.tweet-form__send-btn.tweet-form__send-btn_active', DefaultTimeout);
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
