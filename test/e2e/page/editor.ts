import Timeline from './timeline';

export default class Editor {
    constructor(public client: WebdriverIO.Client<void>) {
    }

    async inputKeys(keys: string | string[]) {
        return this.client.keys(keys);
    }

    async sendButtonIsInactive() {
        return this.client.waitForExist('.tweet-form__send-btn.tweet-form__send-btn_inactive', 500);
    }

    async sendButtonIsActive() {
        return this.client.waitForExist('.tweet-form__send-btn.tweet-form__send-btn_active', 500);
    }

    async sendTweet() {
        await this.client.click('.tweet-form__send-btn.tweet-form__send-btn_active');
        return new Timeline(this.client);
    }

    async cancelTweet() {
        await this.client.click('.tweet-form__cancel-btn');
        return new Timeline(this.client);
    }
}
