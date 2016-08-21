import * as I from 'immutable';
import {Twitter} from 'twit';
import KeyBinds from './keybinds';
import Store from '../store';
import Tweet from '../item/tweet';
import Separator from '../item/separator';
import TimelineActivity from '../item/timeline_activity';
import {
    openUserTimeline,
    addUserTweets,
    openConversationTimeline,
} from '../actions/slave_timeline';
import {showMessage} from '../actions/message';
import {openPicturePreview} from '../actions/tweet_media';
import {
    openEditor,
    openEditorForReply,
} from '../actions/editor';
import {
    changeCurrentTimeline,
    completeMissingStatuses,
    focusNextItem,
    focusPrevItem,
    focusTopItem,
    focusBottomItem,
    unfocusItem,
    likeSucceeded,
    unlikeSucceeded,
    retweetSucceeded,
    unretweetSucceeded,
} from '../actions/timeline';
import TwitterRestApi from '../twitter/rest_api';

function getCurrentStatus(): Tweet | null {
    const timeline = Store.getState().timeline;
    const idx = timeline.focus_index;
    if (idx === null) {
        return null;
    }
    const items = timeline.getCurrentTimeline();
    const item = items.get(idx);
    if (!item) {
        return null;
    }
    if (item instanceof Tweet) {
        return item;
    } else if (item instanceof TimelineActivity) {
        return item.status;
    } else {
        return null;
    }
}

function openMedia() {
    let status = getCurrentStatus();
    if (status === null) {
        return;
    }
    status = status.getMainStatus();

    let media = status.media;
    if (media.length === 0 && status.hasQuote()) {
        media = status.quoted_status!.media;
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
    const status = getCurrentStatus();
    if (status !== null) {
        status.openAllLinksInBrowser();
    }
}

function openStatus() {
    const status = getCurrentStatus();
    if (status !== null) {
        status.openStatusPageInBrowser();
    }
}

function toggleRetweet() {
    const status = getCurrentStatus();
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
    const status = getCurrentStatus();
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

function getFocusedSeparatorIndex() {
    const timeline = Store.getState().timeline;
    const idx = timeline.focus_index;
    if (idx === null) {
        return null;
    }
    if (timeline.getCurrentTimeline().get(idx) instanceof Separator) {
        return idx;
    } else {
        return null;
    }
}

function reply() {
    const owner = Store.getState().timeline.user;
    const status = getCurrentStatus();
    const action =
        status === null ?
            openEditor() :
            openEditorForReply(status.getMainStatus(), owner);
    Store.dispatch(action);
}

function replyOrCompleteMissingStatuses() {
    const sep_idx = getFocusedSeparatorIndex();
    if (sep_idx !== null) {
        Store.dispatch(completeMissingStatuses(sep_idx));
    } else {
        reply();
    }
}

function deleteStatus() {
    const status = getCurrentStatus();
    if (status === null) {
        return;
    }
    TwitterRestApi.destroyStatus(status.id)
        .then(() => Store.dispatch(showMessage('Deleted tweet.', 'info')));
}

function showUser() {
    const status = getCurrentStatus();
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
    const status = getCurrentStatus();
    if (status === null) {
        return;
    }
    Store.dispatch(openConversationTimeline(status.getMainStatus()));
}

export type GlobalAction =
    'open-tweet-form'
  | 'home-timeline'
  | 'mention-timeline'
  | 'open-media'
  | 'open-links'
  | 'retweet'
  | 'like'
  | 'reply'
  | 'conversation'
  | 'delete-status'
  | 'open-status-page'
  | 'show-user'
  | 'unfocus'
  | 'focus-next'
  | 'focus-previous'
  | 'focus-top'
  | 'focus-bottom';

/* tslint:disable:object-literal-key-quotes */

const DefaultMap = I.Map<string, GlobalAction>({
    'tab': 'open-tweet-form',
    'c': 'conversation',
    'i': 'focus-top',
    'j': 'focus-next',
    'k': 'focus-previous',
    'm': 'focus-bottom',
    'o': 'open-media',
    'u': 'show-user',
    'O': 'open-status-page',
    'l': 'open-links',
    '1': 'home-timeline',
    '2': 'mention-timeline',
    'ctrl+r': 'retweet',
    'ctrl+f': 'like',
    'ctrl+D': 'delete-status',
    'enter': 'reply',
    'escape': 'unfocus',
    'down': 'focus-next',
    'up': 'focus-up',
});

const ActionHandlers = I.Map<GlobalAction, () => void>({
    'open-tweet-form': () => Store.dispatch(openEditor()),
    'focus-next': () => Store.dispatch(focusNextItem()),
    'focus-previous': () => Store.dispatch(focusPrevItem()),
    'focus-top': () => Store.dispatch(focusTopItem()),
    'focus-bottom': () => Store.dispatch(focusBottomItem()),
    'home-timeline': () => Store.dispatch(changeCurrentTimeline('home')),
    'mention-timeline': () => Store.dispatch(changeCurrentTimeline('mention')),
    'open-media': openMedia,
    'open-links': openLinks,
    'open-status-page': openStatus,
    'show-user': showUser,
    'retweet': toggleRetweet,
    'like': toggleLike,
    'reply': replyOrCompleteMissingStatuses,
    'conversation': conversation,
    'delete-status': deleteStatus,
    'unfocus': () => Store.dispatch(unfocusItem()),
});

// Note:
// At constructor, we need to load user defined key actions asynchronously.

interface Listenable {
    addEventListener(e: string, cb: (e: Event) => any, capture?: boolean): void;
    removeEventListener(e: string, cb: (e: Event) => any): void;
}

export default class GlobalKeyMaps {
    private keybinds: KeyBinds<GlobalAction>;
    private handler: (e: KeyboardEvent) => void;

    constructor(private listening: Listenable) {
        this.keybinds = new KeyBinds<GlobalAction>(
            DefaultMap,
            ActionHandlers
        );
        this.handler = e => {
            const handled = this.handle(e);
            if (handled) {
                e.preventDefault();
            }
        };
        this.listening.addEventListener('keydown', this.handler);
    }

    enable() {
        if (this.keybinds.enabled || this.listening === null) {
            return;
        }
        this.listening.addEventListener('keydown', this.handler);
        this.keybinds.enabled = true;
    }

    disable() {
        if (!this.keybinds.enabled || this.listening === null) {
            return;
        }
        this.listening.removeEventListener('keydown', this.handler);
        this.keybinds.enabled = false;
    }

    register(seq: string, action: GlobalAction) {
        this.keybinds.registerSequence(seq, action);
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
            return false;
        }

        return this.keybinds.handleAction(resolved);
    }

    listen(l: Listenable) {
        this.listening = l;
        l.addEventListener('keydown', this.handler);
    }
}
