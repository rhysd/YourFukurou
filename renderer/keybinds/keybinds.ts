import * as I from 'immutable';

export interface KeyEvent {
    code: string;
    charcode: number;
    ctrlKey: boolean;
    metaKey: boolean;
    altKey: boolean;
}

const ReCharFromSeq = /[^+]+$/;
const SpecialChars = {
    Enter: 'enter',
    // TODO
} as {[c: string]: string};

function getCharFrom(e: KeyEvent) {
    'use strict';
    for (const c in SpecialChars) {
        if (e.code === c) {
            return SpecialChars[c];
        }
    }
    return String.fromCharCode(e.charcode);
}

export default class KeyBinds<ActionType> {
    enabled: boolean;

    constructor(
        public keymap: I.Map<string, ActionType>,
        public handlers: I.Map<ActionType, () => void>
    ) {
        this.enabled = true;
    }

    registerSequence(seq: string, action: ActionType) {
        this.keymap = this.keymap.set(seq, action);
    }

    registerHandler(action: ActionType, handler: () => void) {
        this.handlers = this.handlers.set(action, handler);
    }

    resolveEvent(key: KeyEvent): ActionType {
        if (!this.enabled) {
            return null;
        }

        let keys = I.Iterable(this.keymap.keySeq());

        if (key.ctrlKey) {
            keys = keys.filter(seq => seq.contains('ctrl+'));
        }
        if (key.altKey) {
            keys = keys.filter(seq => seq.contains('alt+'));
        }
        if (key.metaKey) {
            keys = keys.filter(seq => seq.contains('cmd+'));
        }

        keys = keys.filter(seq => {
            const m = seq.match(ReCharFromSeq);
            if (m === null) {
                return false;
            }
            return getCharFrom(key) === m[0];
        });

        if (keys.isEmpty()) {
            return null;
        }

        return this.keymap.get(keys.first());
    }

    handleAction(action: ActionType) {
        if (!this.enabled) {
            return;
        }

        const handler = this.handlers.get(action);
        if (!handler) {
            return;
        }

        handler();
    }
}
