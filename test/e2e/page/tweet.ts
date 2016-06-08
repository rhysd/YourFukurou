import Editor from './editor';
import {DefaultTimeout} from '../helper/timeouts';

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

    async getActionButton(nth: number) {
        if (nth === 0) {
            throw new Error('Selector index is 1-based.');
        }
        const actions_elem = await this.client.elementIdElement(this.element_id, '.tweet-actions');
        return await this.client.elementIdElement(actions_elem.value.ELEMENT, `.tweet-actions__with-count:nth-Child(${nth})`);
    }

    async replyButton() {
        return await this.getActionButton(1);
    }

    async retweetButton() {
        return await this.getActionButton(2);
    }

    async likeButton() {
        return await this.getActionButton(3);
    }

    async reply() {
        const e = await this.getActionButton(1);
        await this.client.elementIdClick(e.value.ELEMENT);
        return new Editor(this.client);
    }

    async retweet() {
        const e = await this.getActionButton(2);
        await this.client.elementIdClick(e.value.ELEMENT);
        return this;
    }

    async like() {
        const e = await this.getActionButton(3);
        await this.client.elementIdClick(e.value.ELEMENT);
        return this;
    }

    async textIs(text: string) {
        try {
            // XXX:
            await this.client.elementIdElement(this.element_id, 'span=' + text);
            return true;
        } catch (e) {
            return false;
        }
    }
}
