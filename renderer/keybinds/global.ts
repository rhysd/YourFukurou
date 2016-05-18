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

export default class GlobalKeyMaps {
    private keybinds: KeyBinds<GlobalAction>;

    constructor() {
        this.keybinds = new KeyBinds<GlobalAction>(
            DefaultMap,
            ActionHandlers
        );
    }

    enable() {
        this.keybinds.enabled = true;
    }

    disable() {
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
        });

        if (resolved === null) {
            return false;
        }

        return this.keybinds.handleAction(resolved);
    }
}
