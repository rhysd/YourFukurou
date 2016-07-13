import KeymapTransition from '../keybinds/keymap_transition';

export default class TweetMediaState {
    constructor(
        public is_open: boolean,
        public index: number,
        public picture_urls: string[]
    ) {}

    openMedia(urls: string[], start_idx?: number) {
        KeymapTransition.enterMediaPreview();
        return new TweetMediaState(
            true,
            start_idx || 0,
            urls
        );
    }

    closeMedia() {
        KeymapTransition.escapeFromCurrentKeymaps();
        return new TweetMediaState(
            false,
            this.index,
            this.picture_urls
        );
    }

    moveToNthMedia(nth: number) {
        if (nth < 0 || this.picture_urls.length <= nth) {
            return this;
        }
        return new TweetMediaState(
            this.is_open,
            nth,
            this.picture_urls
        );
    }
}

export const DefaultTweetMediaState = new TweetMediaState(false, 0, []);
