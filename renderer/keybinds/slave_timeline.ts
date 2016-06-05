import * as I from 'immutable';
import KeyBinds from './keybinds';
import Store from '../store';
import {
    closeSlaveTimeline,
    focusSlaveNext,
    focusSlavePrev,
    focusSlaveTop,
    focusSlaveBottom,
    blurSlaveTimeline,
} from '../actions';
import log from '../log';

export type SlaveTimelineAction =
    'focus-top' |
    'focus-bottom' |
    'focus-next' |
    'focus-prev' |
    'blur' |
    'close';

const DefaultMap = I.Map<string, SlaveTimelineAction>({
    'j': 'focus-next',
    'k': 'focus-prev',
    'i': 'focus-top',
    'm': 'focus-bottom',
    'escape': 'blur',
    'x': 'close',
});

const ActionHandlers = I.Map<SlaveTimelineAction, () => void>({
    'close': () => Store.dispatch(closeSlaveTimeline()),
    'focus-next': () => Store.dispatch(focusSlaveNext()),
    'focus-prev': () => Store.dispatch(focusSlavePrev()),
    'focus-top': () => Store.dispatch(focusSlaveTop()),
    'focus-bottom': () => Store.dispatch(focusSlaveBottom()),
    'blur': () => Store.dispatch(blurSlaveTimeline()),
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

