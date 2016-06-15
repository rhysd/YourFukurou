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
    createLike,
    destroyLike,
    sendRetweet,
    undoRetweet,
    destroyStatus,
    openUserTimeline,
} from '../actions';
import {UserTimeline} from '../states/slave_timeline';
import log from '../log';

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
    const slave = Store.getState().slaveTimeline;
    if (slave instanceof UserTimeline) {
        return slave.getFocusedStatus();
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
    const action = s.retweeted ? undoRetweet(s.id) : sendRetweet(s.id);
    Store.dispatch(action);
}

function toggleLike() {
    const status = getFocusedStatus();
    if (status === null) {
        return;
    }
    const s = status.getMainStatus();
    const action = s.favorited ? destroyLike(s.id) : createLike(s.id);
    Store.dispatch(action);
}

function reply() {
    const owner = Store.getState().timeline.user;
    const status = getFocusedStatus();
    const action =
        status === null ?
            openEditor() :
            openEditorForReply(status.getMainStatus(), owner);
    Store.dispatch(action);
}

function deleteStatus() {
    const status = getFocusedStatus();
    if (status === null) {
        return;
    }
    Store.dispatch(destroyStatus(status.id));
}

function showUser() {
    const status = getFocusedStatus();
    if (status === null) {
        return;
    }
    const user = status.getMainStatus().user;
    Store.dispatch(openUserTimeline(user));
}

export type SlaveTimelineAction =
    'open-tweet-form' |
    'open-media' |
    'open-links' |
    'retweet' |
    'like' |
    'reply' |
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
    'reply': reply,
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

