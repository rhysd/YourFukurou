export interface TweetTextHashtag {
    text: string;
}

export interface TweetTextMention {
    screen_name: string;
    name: string;
    id: number;
}

export interface TweetTextUrl {
    url: string;
    expanded_url: string;
    display_url: string;
}

export type TweetTextToken = string | TweetTextHashtag | TweetTextMention | TweetTextUrl;

export function isHashtag(t: TweetTextToken): t is TweetTextHashtag {
    'use strict';
    return t.hasOwnProperty('text');
}

export function isMention(t: TweetTextToken): t is TweetTextMention {
    'use strict';
    return t.hasOwnProperty('screen_name');
}

export function isUrl(t: TweetTextToken): t is TweetTextUrl {
    'use strict';
    return t.hasOwnProperty('url');
}

const UNESCAPE_TABLE = {
    '&amp;': '&',
    '&gt;': '>',
    '&lt;': '<',
    '&quot;': '"',
    '&#x27;': "'",
} as {[s: string]: string};
function htmlUnescapeReplacer(s: string) {
    'use strict';
    return UNESCAPE_TABLE[s];
}

const RE_UNESCAPE = /(?:&amp;|&gt;|&lt;|&quot;|&#x27;)/g;

function htmlUnescape(text: string) {
    'use strict';
    return text.replace(RE_UNESCAPE, htmlUnescapeReplacer);
}

const RE_ENTITY = /(?:@\w+|https?:\/\/t\.co\/\w+|#)/;

export default class TweetTextParser {
    private pos: number;
    private len: number;
    private text: string;
    private hashtags: TweetTextHashtag[];
    private urls: TweetTextUrl[];
    private mentions: TweetTextMention[];
    private result: TweetTextToken[];

    constructor(private json: TweetJson) {
        this.pos = 0;
        this.text = htmlUnescape(json.text);
        this.len = this.text.length;
        if (!json.entities) {
            this.hashtags = [];
            this.urls = [];
            this.mentions = [];
        }
        this.hashtags = json.entities.hashtags || [];
        this.urls = json.entities.urls || [];
        this.mentions = json.entities.user_mentions || [];
    }

    getUrlFrom(url: string): TweetTextUrl {
        for (const u of this.urls) {
            if (u.url === url) {
                return u;
            }
        }
        return {
            url,
            expanded_url: url,
            display_url: url,
        };
    }

    getMentionFrom(mention: string) {
        for (const m of this.mentions) {
            if (m.screen_name === mention) {
                return m;
            }
        }
        return null;
    }

    getHashTagWithMatch(match: RegExpExecArray) {
        const hint_idx = match.index + 1;
        for (const h of this.hashtags) {
            if (this.text.startsWith(h.text, hint_idx)) {
                // XXX: Correct index to keep pace with other getSomething() methods.
                match.index += h.text.length;
                return h;
            }
        }
        return null;
    }

    eatEntity(match: RegExpExecArray): TweetTextToken {
        const s = match[0];
        if (s.startsWith('http')) {
            return this.getUrlFrom(s);
        } else if (s.startsWith('@')) {
            return this.getMentionFrom(s.slice(1) /* Omit '@' */);
        } else if (s.startsWith('#')) {
            return this.getHashTagWithMatch(match);
        } else {
            return null;
        }
    }

    eatOne() {
        const match = RE_ENTITY.exec(this.text);
        if (match === null) {
            const t = this.text;
            this.text = '';
            return [t];
        }

        let tokens = [] as TweetTextToken[];

        if (match.index !== 0) {
            tokens.push(this.text.slice(0, match.index));
        }

        const entity = this.eatEntity(match);
        if (entity === null) {
            tokens.push(match[0]);
        } else {
            tokens.push(entity);
        }

        this.text = this.text.slice(match.index + match[0].length);
        return tokens;
    }

    parse() {
        if (this.result !== undefined) {
            return this.result;
        }

        let tokens = [] as TweetTextToken[];
        const push = Array.prototype.push;

        while (this.text !== '') {
            const ts = this.eatOne();
            push.apply(tokens, ts);
        }

        this.result = tokens;
        return tokens;
    }
}
