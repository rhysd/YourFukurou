import Editor from './editor';
import Timeline from './timeline';
import {DefaultTimeout} from '../helper/timeouts';

export default class SideMenu {
    constructor(public client: WebdriverIO.Client<void>) {
    }

    async activeButtons() {
        return (await this.client.elements('.side-menu__button.side-menu__button_active')).value;
    }

    async openEditor() {
        await this.client.click('.side-menu__button .fa.fa-pencil-square-o');
        return new Editor(this.client);
    }

    async switchToHome() {
        await this.client.click('.side-menu__button .fa.fa-home');
        return new Timeline(this.client);
    }

    async switchToMention() {
        await this.client.click('.side-menu__button .fa.fa-comments');
        return new Timeline(this.client);
    }

    async homeButtonIsActive() {
        await this.client.waitForExist('.side-menu__button.side-menu__button_active .fa.fa-home', DefaultTimeout);
    }

    async homeButtonIsInactive() {
        await this.client.waitForExist('.side-menu__button.side-menu__button_active .fa.fa-home', DefaultTimeout, true);
    }

    async mentionButtonIsActive() {
        await this.client.waitForExist('.side-menu__button.side-menu__button_active .fa.fa-comments', DefaultTimeout);
    }

    async mentionButtonIsInactive() {
        await this.client.waitForExist('.side-menu__button.side-menu__button_active .fa.fa-comments', DefaultTimeout, true);
    }
}

