import Message from './message';
import {DefaultTimeout} from '../helper/timeouts';

export default class Timeline {
    constructor(public client: WebdriverIO.Client<void>) {
    }

    async ensureRootNode() {
        await this.client.waitForExist('#yourfukurou', DefaultTimeout);
        return this;
    }

    async clickFirstTweet() {
        const e = await this.client.element('.tweet__body');
        await this.clickTweet(e.value.ELEMENT);
    }

    async allTweets() {
        const raw = await this.client.elements('.tweet__body');
        return raw.value;
    }

    async findTweetByText(text: string) {
        const tweets = await this.allTweets();
        for (const id of tweets.map(e => e.ELEMENT)) {
            try {
                await this.client.elementIdElements(id, 'span=' + text);
                return id;
            } catch (e) {
                // Note: Not found
            }
        }
        return null;
    }

    async deleteTweet(element_id: string) {
        // Focus
        await this.client.elementIdClick(element_id);

        const btn = await this.client.elementIdElement(element_id, '.tweet-actions__others');
        await this.client.elementIdClick(btn.value.ELEMENT);

        await this.client.click('.tweet-actions__others-menu-item');
        await this.client.pause(3000);  // Wait response of favorites/create
    }

    async clickTweet(element_id: string) {
        const elem = await this.client.elementIdElement(element_id, '.tweet__secondary');
        await this.client.elementIdClick(elem.value.ELEMENT);
    }

    async ensureNoFocusedItem() {
        await this.client.waitForExist('.tweet__body.tweet__body_focused', DefaultTimeout, true);
        return this;
    }

    async ensureFocusedItem() {
        await this.client.waitForExist('.tweet__body.tweet__body_focused', DefaultTimeout);
        return this;
    }
}
