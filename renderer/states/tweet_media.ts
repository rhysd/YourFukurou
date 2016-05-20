import MediaPreviewKeyMaps from '../keybinds/media_preview';
import GlobalKeymaps from '../keybinds/global';

export default class TweetMediaState {
    constructor(
        public is_open: boolean,
        public index: number,
        public picture_urls: string[],
        public keybinds: MediaPreviewKeyMaps
    ) {}

    openMedia(urls: string[], start_idx: number) {
        GlobalKeymaps.disable();
        this.keybinds.enable(window);
        return new TweetMediaState(
            true,
            start_idx || 0,
            urls,
            this.keybinds
        );
    }

    closeMedia() {
        this.keybinds.disable();
        GlobalKeymaps.enable();
        return new TweetMediaState(
            false,
            this.index,
            this.picture_urls,
            this.keybinds
        );
    }

    moveToNthMedia(nth: number) {
        if (nth < 0 || this.picture_urls.length <= nth) {
            return this;
        }
        return new TweetMediaState(
            this.is_open,
            nth,
            this.picture_urls,
            this.keybinds
        );
    }
}

export const DefaultTweetMediaState = new TweetMediaState(false, 0, [], new MediaPreviewKeyMaps);
