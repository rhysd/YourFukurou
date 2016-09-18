import {Twitter} from 'twit';

export const MaxHashtagHistories = 5;
const StorageKey = 'hashtag_completion_history';

export default class HashtagCompletionHistory {
    data: string[];

    getHashtags(): string[] {
        if (this.data === undefined) {
            const stored = window.localStorage.getItem(StorageKey);
            if (stored === null) {
                this.data = [];
            } else {
                this.data = JSON.parse(stored);
            }
        }
        return this.data;
    }

    dump() {
        console.log('HashtagCompletionHistory:', this.getHashtags());
    }

    storeHashtagsInTweet(json: Twitter.Status) {
        if (!json.entities || !json.entities.hashtags) {
            return;
        }
        this.storeHashtags(json.entities.hashtags.map(h => h.text));
    }

    storeHashtags(hashtags: string[]) {
        const stored = this.getHashtags();
        for (const h of hashtags) {
            this.storeHashtagTo(stored, h);
        }
        this.storeToStorage(stored);
    }

    private storeHashtagTo(data: string[], hashtag: string) {
        const stored = this.getHashtags();
        const idx = stored.indexOf(hashtag);
        if (idx !== -1) {
            stored.splice(idx, 1);
        }
        stored.unshift(hashtag);
        while (stored.length > MaxHashtagHistories) {
            stored.pop();
        }
        this.storeToStorage(stored);
        return data;
    }

    private storeToStorage(hashtags: string[]) {
        this.data = hashtags;
        window.setImmediate(() => {
            window.localStorage.setItem(StorageKey, JSON.stringify(hashtags));
        });
    }
}
