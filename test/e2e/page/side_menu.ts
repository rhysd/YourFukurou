import Editor from './editor';

export default class SideMenu {
    constructor(public client: WebdriverIO.Client<void>) {
    }

    async activeButtons() {
        return (await this.client.elements('.side-menu__button.side-menu__button_active')).value;
    }

    async openEditor() {
        await this.client.click('.side-menu__button');
        return new Editor(this.client);
    }
}
