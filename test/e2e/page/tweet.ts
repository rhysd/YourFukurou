export {DefaultTimeout} from '../helper/timeouts';

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
        await this.click();

        const btn = await this.client.elementIdElement(this.element_id, '.tweet-actions__others');
        await this.client.elementIdClick(btn.value.ELEMENT);

        await this.client.click('.tweet-actions__others-menu-item');
        await this.client.pause(5000);  // Wait response of favorites/create
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
