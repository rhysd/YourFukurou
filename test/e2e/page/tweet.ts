import Editor from './editor';

const API_RESPONSE_TIME = 2000;

export default class Tweet {
    constructor(
        public client: WebdriverIO.Client<void>,
        public element_id: string) {
    }

    async click() {
        const e = await this.client.elementIdElement(this.element_id, '.tweet__secondary');
        await this.client.elementIdClick(e.value.ELEMENT);
        return this;
    }

    async delete() {
        const btn = await this.client.elementIdElement(this.element_id, '.tweet-actions__others');
        await this.client.elementIdClick(btn.value.ELEMENT);

        await this.client.click('.tweet-actions__others-menu-item');
        await this.client.pause(5000);  // Wait response of favorites/create
    }

    async replyButton() {
        return await this.client.elementIdElement(this.element_id, '.tweet-actions__reply');
    }

    async retweetButton() {
        return await this.client.elementIdElement(this.element_id, '.tweet-actions__retweet');
    }

    async likeButton() {
        return await this.client.elementIdElement(this.element_id, '.tweet-actions__like');
    }

    async reply() {
        const e = await this.replyButton();
        await this.client.elementIdClick(e.value.ELEMENT);
        return new Editor(this.client);
    }

    async retweet() {
        const e = await this.retweetButton();
        await this.client.elementIdClick(e.value.ELEMENT);
        await this.client.pause(API_RESPONSE_TIME);
        return this;
    }

    async like() {
        const e = await this.likeButton();
        await this.client.elementIdClick(e.value.ELEMENT);
        await this.client.pause(API_RESPONSE_TIME);
        return this;
    }

    async textIs(text: string) {
        try {
            const elem = await this.client.elementIdElement(this.element_id, '*=' + text);
            return elem.value !== null;
        } catch (e) {
            return false;
        }
    }
}
