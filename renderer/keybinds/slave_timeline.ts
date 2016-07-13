import * as I from 'immutable';
import {Twitter} from 'twit';
import KeyBinds from './keybinds';
import Store from '../store';
import {
    closeSlaveTimeline,
    focusSlaveNext,
    focusSlavePrev,
    focusSlaveTop,
    focusSlaveBottom,
    blurSlaveTimeline,
    openEditor,
    openEditorForReply,
    openPicturePreview,
    likeSucceeded,
    unlikeSucceeded,
    retweetSucceeded,
    unretweetSucceeded,
    openUserTimeline,
    addUserTweets,
    showMessage,
    openConversationTimeline,
} from '../actions';
import {UserTimeline} from '../states/slave_timeline';
import log from '../log';
import TwitterRestApi from '../twitter/rest_api';
import Tweet from '../item/tweet';
import Separator from '../item/separator';
import {dispatchOlderTweets} from '../components/slave_timeline/user';

function getCurrentUser() {
    const slave = Store.getState().slaveTimeline;
    if (slave instanceof UserTimeline) {
        return slave.user;
    } else {
        return null;
    }
}

function openUserPage() {
    const user = getCurrentUser();
    if (user !== null) {
        user.openUserPageInBrowser();
    }
}

function openUserWebsite() {
    const user = getCurrentUser();
    if (user !== null) {
        user.openWebsiteInBrowser();
    }
}

function getFocusedStatus() {
    const item = Store.getState().slaveTimeline.getFocusedItem();
    if (item instanceof Tweet) {
        return item;
    } else {
        return null;
    }
}

function openMedia() {
    let status = getFocusedStatus();
    if (status === null) {
        return;
    }
    status = status.getMainStatus();

    let media = status.media;
    if (media.length === 0 && status.hasQuote()) {
        media = status.quoted_status.media;
    }
    if (media.length === 0) {
        return;
    }

    Store.dispatch(
        openPicturePreview(
            media.map((m: Twitter.MediaEntity) => m.media_url)
        )
    );
}

function openLinks() {
    const status = getFocusedStatus();
    if (status !== null) {
        status.openAllLinksInBrowser();
    }
}

function openStatus() {
    const status = getFocusedStatus();
    if (status !== null) {
        status.openStatusPageInBrowser();
    }
}

function toggleRetweet() {
    const status = getFocusedStatus();
    if (status === null) {
        return;
    }
    const s = status.getMainStatus();
    if (s.retweeted) {
        TwitterRestApi.unretweet(s.id)
            .then(res => Store.dispatch(unretweetSucceeded(new Tweet(res))));
    } else {
        TwitterRestApi.retweet(s.id)
            .then(res => Store.dispatch(retweetSucceeded(new Tweet(res))));
    }
}

function toggleLike() {
    const status = getFocusedStatus();
    if (status === null) {
        return;
    }
    const s = status.getMainStatus();
    if (s.favorited) {
        TwitterRestApi.unlike(s.id)
            .then(json => Store.dispatch(unlikeSucceeded(new Tweet(json))));
    } else {
        TwitterRestApi.like(s.id)
            .then(json => Store.dispatch(likeSucceeded(new Tweet(json))));
    }
}

function reply(status: Tweet) {
    const owner = Store.getState().timeline.user;
    const action = openEditorForReply(status.getMainStatus(), owner);
    Store.dispatch(action);
}

function replyOrCompleteMissingStatuses() {
    const tl = Store.getState().slaveTimeline;
    const item = tl.getFocusedItem();
    if (item instanceof Tweet) {
        reply(item);
    } else if (item instanceof Separator) {
        if (tl instanceof UserTimeline && tl.focus_index !== null) {
            dispatchOlderTweets(tl, Store.dispatch);
        }
    }
}

function deleteStatus() {
    const status = getFocusedStatus();
    if (status === null) {
        return;
    }
    TwitterRestApi.destroyStatus(status.id)
        .then(() => Store.dispatch(showMessage('Deleted tweet.', 'info')));
}

function showUser() {
    const status = getFocusedStatus();
    if (status === null) {
        return;
    }
    const user = status.getMainStatus().user;
    Store.dispatch(openUserTimeline(user));
    TwitterRestApi.userTimeline(user.id).then(res => {
        const action = addUserTweets(user.id, res.map(json => new Tweet(json)));
        window.requestIdleCallback(() => Store.dispatch(action));
    });
}

function conversation() {
    const status = getFocusedStatus();
    if (status === null) {
        return;
    }
    Store.dispatch(openConversationTimeline(status.getMainStatus()));
}

export type SlaveTimelineAction =
    'open-tweet-form' |
    'open-media' |
    'open-links' |
    'retweet' |
    'like' |
    'reply' |
    'conversation' |
    'delete-status' |
    'open-status-page' |
    'show-user' |
    'focus-top' |
    'focus-bottom' |
    'focus-next' |
    'focus-prev' |
    'blur' |
    'open-user-page' |
    'open-user-website' |
    'close';

const DefaultMap = I.Map<string, SlaveTimelineAction>({
    'tab': 'open-tweet-form',
    'c': 'conversation',
    'o': 'open-media',
    'l': 'open-links',
    'ctrl+r': 'retweet',
    'ctrl+f': 'like',
    'enter': 'reply',
    'ctrl+D': 'delete-status',
    'O': 'open-status-page',
    'u': 'show-user',
    'j': 'focus-next',
    'k': 'focus-prev',
    'i': 'focus-top',
    'm': 'focus-bottom',
    'escape': 'blur',
    'ctrl+u': 'open-user-page',
    'ctrl+w': 'open-user-website',
    'x': 'close',
});

const ActionHandlers = I.Map<SlaveTimelineAction, () => void>({
    'close': () => Store.dispatch(closeSlaveTimeline()),
    'focus-next': () => Store.dispatch(focusSlaveNext()),
    'focus-prev': () => Store.dispatch(focusSlavePrev()),
    'focus-top': () => Store.dispatch(focusSlaveTop()),
    'focus-bottom': () => Store.dispatch(focusSlaveBottom()),
    'blur': () => Store.dispatch(blurSlaveTimeline()),
    'open-tweet-form': () => Store.dispatch(openEditor()),
    'open-media': openMedia,
    'open-links': openLinks,
    'retweet': toggleRetweet,
    'like': toggleLike,
    'reply': replyOrCompleteMissingStatuses,
    'conversation': conversation,
    'delete-status': deleteStatus,
    'open-status-page': openStatus,
    'show-user': showUser,
    'open-user-page': openUserPage,
    'open-user-website': openUserWebsite,
});

interface Listenable {
    addEventListener(e: string, cb: (e: Event) => any, capture?: boolean): void;
    removeEventListener(e: string, cb: (e: Event) => any): void;
}

// Note:
// Need to create common class for MediaPreviewKeyMaps and SlaveTimelineKeyMaps
export default class SlaveTimelineKeyMaps {
    private keybinds: KeyBinds<SlaveTimelineAction>;
    private listening: Listenable;
    private handler: (e: KeyboardEvent) => void;

    constructor() {
        this.keybinds = new KeyBinds<SlaveTimelineAction>(
            DefaultMap,
            ActionHandlers
        );
        this.handler = this.handle.bind(this);
        this.listening = null;
    }

    enable(l: Listenable) {
        if (this.listening !== null) {
            log.debug('Already listening:', this.listening);
            return;
        }
        this.listening = l;
        l.addEventListener('keydown', this.handler);
    }

    disable() {
        if (this.listening === null) {
            log.debug('Already disabled:');
            return;
        }
        this.listening.removeEventListener('keydown', this.handler);
        this.listening = null;
    }

    handle(e: KeyboardEvent) {
        const resolved = this.keybinds.resolveEvent({
            code: (e as any).code,  // KeyboardEvent.code is not defined in .d.ts
            charcode: e.keyCode,
            ctrlKey: e.ctrlKey,
            metaKey: e.metaKey,
            altKey: e.altKey,
            shiftKey: e.shiftKey,
        });

        if (resolved === null) {
            return;
        }

        const handled = this.keybinds.handleAction(resolved);
        if (handled) {
            e.preventDefault();
            e.stopPropagation();
        }
    }

    register(seq: string, action: SlaveTimelineAction) {
        this.keybinds.registerSequence(seq, action);
    }
}

