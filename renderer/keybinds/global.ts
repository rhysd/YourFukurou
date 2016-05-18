import * as I from 'immutable';
import KeyBinds from './keybinds';
import Store from '../store';
import {
    focusNextItem,
    focusPrevItem,
    focusTopItem,
    focusBottomItem,
    openEditor,
} from '../actions';

export type GlobalAction =
    'open-tweet-form'
  | 'focus-next'
  | 'focus-previous'
  | 'focus-top'
  | 'focus-bottom';

const DefaultMap = I.Map<string, GlobalAction>({
    'tab': 'open-tweet-form',
    'i': 'focus-top',
    'm': 'focus-bottom',
    'j': 'focus-next',
    'k': 'focus-previous',
});

const ActionHandlers = I.Map<GlobalAction, () => void>({
    'open-tweet-form': () => Store.dispatch(openEditor()),
    'focus-next': () => Store.dispatch(focusNextItem()),
    'focus-previous': () => Store.dispatch(focusPrevItem()),
    'focus-top': () => Store.dispatch(focusTopItem()),
    'focus-bottom': () => Store.dispatch(focusBottomItem()),
});

// Note:
// At constructor, we need to load user defined key actions asynchronously.

interface Listenable {
    addEventListener(e: string, cb: (e: Event) => any, capture?: boolean): void;
    removeEventListener(e: string, cb: (e: Event) => any): void;
}

export class GlobalKeyMaps {
    private keybinds: KeyBinds<GlobalAction>;
    private listening: Listenable;
    private handler: (e: KeyboardEvent) => void;

    constructor() {
        this.keybinds = new KeyBinds<GlobalAction>(
            DefaultMap,
            ActionHandlers
        );
        this.listening = null;
        this.handler = this.handle.bind(this);
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
        e.preventDefault();
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

export default new GlobalKeyMaps();
