import * as I from 'immutable';
import log from '../log';

export interface KeyEvent {
    code: string;
    charcode: number;
    ctrlKey: boolean;
    metaKey: boolean;
    altKey: boolean;
    shiftKey: boolean;
}

interface PreparsedSeq {
    char: string;
    ctrlKey: boolean;
    metaKey: boolean;
    altKey: boolean;
    shiftKey: boolean;
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
    return String.fromCharCode(e.charcode).toLowerCase();
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
            ).filter(kv => !!kv[0])
        );
        log.debug('Editor keymap:', this.keymap);
    }

    registerSequence(seq: string, action: ActionType) {
        const preparsed = this.parseSequence(seq);
        if (preparsed === null) {
            log.debug('Preparse failed for sequence ' + seq);
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

        const c = m[0].toLowerCase();
        let p: PreparsedSeq = {
            char: c,
            ctrlKey: false,
            metaKey: false,
            altKey: false,
            shiftKey: c !== m[0],
        };

        if (seq.includes('ctrl+')) {
            p.ctrlKey = true;
        }
        if (seq.includes('alt+')) {
            p.altKey = true;
        }
        if (seq.includes('cmd+')) {
            if (process.platform === 'darwin') {
                p.metaKey = true;
            } else {
                p.ctrlKey = true;
            }
        }

        log.debug('Key sequence parsed correctly:', seq, p);
        return p;
    }

    resolveEvent(key: KeyEvent): ActionType {
        if (!this.enabled) {
            return null;
        }

        if (!key.code) {
            log.debug('Ignoring modifier-only key', key);
            return null;
        }

        const filtered = this.keymap
                .keySeq()
                .filter(p =>
                    (key.ctrlKey === p.ctrlKey) &&
                    (key.metaKey === p.metaKey) &&
                    (key.altKey === p.altKey) &&
                    (key.shiftKey === p.shiftKey) &&
                    getCharFrom(key) === p.char
                );

        if (filtered.isEmpty()) {
            log.debug('No action found for', key);
            return null;
        }

        const resolved = filtered.first();
        const corresponding = this.keymap.get(resolved);
        log.debug('Key input is resolved to action:', key, resolved, corresponding);

        return corresponding;
    }

    handleAction(action: ActionType) {
        if (!this.enabled) {
            return false;
        }

        const handler = this.handlers.get(action);
        if (!handler) {
            log.debug('Action handler not found for ' + action);
            return false;
        }

        handler();
        log.debug('Action ' + action + ' was handled.');
        return true;
    }
}
