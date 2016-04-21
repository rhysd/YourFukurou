import * as I from 'immutable';

export interface KeyEvent {
    code: string;
    charcode: number;
    ctrlKey: boolean;
    metaKey: boolean;
    altKey: boolean;
}

interface PreparsedSeq {
    char: string;
    ctrlKey: boolean;
    metaKey: boolean;
    altKey: boolean;
}

const ReCharFromSeq = /[^+]+$/;
const SpecialChars = {
    Enter: 'enter',
    Tab: 'tab',
    Backspace: 'backspace',
    PageUp: 'pageup',
    PageDown: 'pagedown',
    Escape: 'escape',
    Space: 'space',
    End: 'end',
    Home: 'home',
    ArrowLeft: 'left',
    ArrowRight: 'right',
    ArrowUp: 'up',
    ArrowDown: 'down',
    Insert: 'insert',
    Delete: 'delete',
    Help: 'help',
    F1: 'f1',
    F2: 'f2',
    F3: 'f3',
    F4: 'f4',
    F5: 'f5',
    F6: 'f6',
    F7: 'f7',
    F8: 'f8',
    F9: 'f9',
    F10: 'f10',
    F11: 'f11',
    F12: 'f12',
} as {[c: string]: string};

function getCharFrom(e: KeyEvent) {
    'use strict';
    if (e.code in SpecialChars) {
        return SpecialChars[e.code];
    }
    return String.fromCharCode(e.charcode);
}

export default class KeyBinds<ActionType> {
    enabled: boolean;
    keymap: I.Map<PreparsedSeq, ActionType>;

    constructor(
        default_map: I.Map<string, ActionType>,
        public handlers: I.Map<ActionType, () => void>
    ) {
        this.enabled = true;
        this.keymap = I.Map<PreparsedSeq, ActionType>(
            default_map
            .entrySeq()
            .map(
                (kv: [string, ActionType]) =>
                    [this.parseSequence(kv[0]), kv[1]]
            ).filter(kv => kv[0] !== null)
        );
    }

    registerSequence(seq: string, action: ActionType) {
        const preparsed = this.parseSequence(seq);
        if (preparsed === null) {
            return false;
        }
        this.keymap = this.keymap.set(preparsed, action);
        return true;
    }

    registerHandler(action: ActionType, handler: () => void) {
        this.handlers = this.handlers.set(action, handler);
    }

    parseSequence(seq: string): PreparsedSeq {
        const m = seq.match(ReCharFromSeq);
        if (m === null) {
            return null;
        }

        let e: PreparsedSeq = {
            char: m[0],
            ctrlKey: false,
            metaKey: false,
            altKey: false,
        };

        if (seq.contains('ctrl+')) {
            e.ctrlKey = true;
        }
        if (seq.contains('alt+')) {
            e.altKey = true;
        }
        if (seq.contains('cmd+')) {
            if (process.platform === 'darwin') {
                e.metaKey = true;
            } else {
                e.ctrlKey = true;
            }
        }

        return e;
    }

    resolveEvent(key: KeyEvent): ActionType {
        if (!this.enabled) {
            return null;
        }

        const filtered = this.keymap
                .keySeq()
                .filter(p => {
                    if ((key.ctrlKey !== p.ctrlKey) ||
                        (key.metaKey !== p.metaKey) ||
                        (key.altKey !== p.altKey)) {
                        return false;
                    }
                    return getCharFrom(key) === p.char;
                });

        if (filtered.isEmpty()) {
            return null;
        }

        return this.keymap.get(filtered.first());
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
