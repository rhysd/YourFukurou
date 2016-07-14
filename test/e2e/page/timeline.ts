import Tweet from './tweet';
import {DefaultTimeout} from '../helper/timeouts';

export default class Timeline {
    constructor(public client: WebdriverIO.Client<void>) {
    }

    async ensureRootNode() {
        await this.client.waitForExist('#yourfukurou', DefaultTimeout);
        return this;
    }

    async waitForTweet() {
        await this.client.waitForExist('.tweet__body', DefaultTimeout);
        return this;
    }

    async firstTweet() {
        const e = await this.client.element('.tweet__body');
        return new Tweet(this.client, e.value.ELEMENT);
    }

    async secondTweet() {
        const e = await this.client.element('.tweet__body:nth-Child(2)');
        return new Tweet(this.client, e.value.ELEMENT);
    }

    async allTweets() {
        const raw = await this.client.elements('.tweet__body');
        return raw.value.map(e => new Tweet(this.client, e.ELEMENT));
    }

    async findTweetByText(text: string) {
        const tweets = await this.allTweets();
        for (const tw of tweets) {
            if (await tw.textIs(text)) {
                return tw;
            }
        }
        return null;
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
