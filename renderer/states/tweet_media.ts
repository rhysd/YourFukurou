export default class TweetMediaState {
    constructor(
        public readonly is_open: boolean,
        public readonly index: number,
        public readonly picture_urls: string[],
    ) {}

    openMedia(urls: string[], start_idx?: number) {
        return new TweetMediaState(
            true,
            start_idx || 0,
            urls,
        );
    }

    closeMedia() {
        return new TweetMediaState(
            false,
            this.index,
            this.picture_urls,
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
        );
    }
}

export const DefaultTweetMediaState = new TweetMediaState(false, 0, []);
