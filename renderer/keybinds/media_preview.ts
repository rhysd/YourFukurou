import * as I from 'immutable';
import KeyBinds from './keybinds';
import Store from '../store';
import {moveToNthPicturePreview, closeTweetMedia} from '../actions/tweet_media';
import log from '../log';

function nextPic() {
    const media = Store.getState().tweetMedia;
    if (!media.is_open) {
        return;
    }

    const idx = media.index;
    if (idx + 1 >= media.picture_urls.length) {
        return;
    }

    Store.dispatch(moveToNthPicturePreview(idx + 1));
}

function prevPic() {
    const media = Store.getState().tweetMedia;
    if (!media.is_open) {
        return;
    }

    const idx = media.index;
    if (idx <= 0) {
        return;
    }

    Store.dispatch(moveToNthPicturePreview(idx - 1));
}

export type MediaPreviewAction =
        'next-picture' |
        'previous-picture' |
        'close-preview';

const DefaultMap = I.Map<string, MediaPreviewAction>({
    'j': 'next-picture',
    'k': 'previous-picture',
    'l': 'next-picture',
    'h': 'previous-picture',
    'x': 'close-preview',
    'escape': 'close-preview',
    'left': 'previous-picture',
    'right': 'next-picture',
});

const ActionHandlers = I.Map<MediaPreviewAction, () => void>({
    'next-picture': nextPic,
    'previous-picture': prevPic,
    'close-preview': () => Store.dispatch(closeTweetMedia()),
});

interface Listenable {
    addEventListener(e: string, cb: (e: Event) => any, capture?: boolean): void;
    removeEventListener(e: string, cb: (e: Event) => any): void;
}

export default class MediaPreviewKeyMaps {
    private keybinds: KeyBinds<MediaPreviewAction>;
    private listening: Listenable | null;
    private handler: (e: KeyboardEvent) => void;

    constructor() {
        this.keybinds = new KeyBinds<MediaPreviewAction>(
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

    register(seq: string, action: MediaPreviewAction) {
        this.keybinds.registerSequence(seq, action);
    }
}
