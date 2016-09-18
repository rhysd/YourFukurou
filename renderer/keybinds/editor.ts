import * as I from 'immutable';
import * as React from 'react';
import {KeyBindingUtil} from 'draft-js';
import KeyBinds, {Listenable} from './keybinds';
import log from '../log';
import Store from '../store';
import {
    upAutoCompletionFocus,
    downAutoCompletionFocus,
    stopAutoCompletion,
} from '../actions/editor_completion';
import {closeEditor} from '../actions/editor';

const hasCommandModifier = KeyBindingUtil.hasCommandModifier;
const isCtrlKeyCommand = KeyBindingUtil.isCtrlKeyCommand;
const isOptionKeyCommand = KeyBindingUtil.isOptionKeyCommand;

export type EditorAction = 'send-tweet'
                            | 'choose-suggestion'
                            | 'close-editor'
                            | 'cancel-suggestion'
                            | 'select-next-suggestion'
                            | 'select-previous-suggestion';

/* tslint:disable:object-literal-key-quotes */
const DefaultMap = I.Map<string, EditorAction>({
    'ctrl+enter': 'send-tweet',
    'ctrl+g': 'cancel-suggestion',
    'enter': 'choose-suggestion',
    'tab': 'select-next-suggestion',
});

function isEditorAction(s: string): s is EditorAction {
    return s === 'send-tweet' ||
           s === 'cancel-suggestion' ||
           s === 'choose-suggestion' ||
           s === 'close-editor' ||
           s === 'select-next-suggestion' ||
           s === 'select-previous-suggestion';
}

function getCodeWorkaround(e: React.KeyboardEvent) {
    switch (e.keyCode) {
        case 8:   return 'Backspace';
        case 9:   return 'Tab';
        case 10:  return 'Enter';  // NL
        case 13:  return 'Enter';  // CR
        case 33:  return 'PageUp';
        case 34:  return 'PageDown';
        case 27:  return 'Escape';
        case 32:  return 'Space';
        case 35:  return 'End';
        case 36:  return 'Home';
        case 37:  return 'ArrowLeft';
        case 38:  return 'ArrowUp';
        case 39:  return 'ArrowRight';
        case 40:  return 'ArrowDown';
        case 45:  return 'Insert';
        case 46:  return 'Delete';
        case 47:  return 'Help';
        case 112: return 'F1';
        case 113: return 'F2';
        case 114: return 'F3';
        case 115: return 'F4';
        case 116: return 'F5';
        case 117: return 'F6';
        case 118: return 'F7';
        case 119: return 'F8';
        case 120: return 'F9';
        case 121: return 'F10';
        case 122: return 'F11';
        case 123: return 'F12';
        default:  {
            const ch = String.fromCharCode(e.keyCode);
            return e.shiftKey ? ch.toUpperCase() : ch.toLowerCase();
        }
    }
}

const ActionHandlers = I.Map<EditorAction, () => void>({
    'select-next-suggestion': () => Store.dispatch(downAutoCompletionFocus()),
    'select-previous-suggestion': () => Store.dispatch(upAutoCompletionFocus()),
    'close-editor': () => Store.dispatch(closeEditor()),
    'cancel-suggestion': () => Store.dispatch(stopAutoCompletion()),
});

export default class EditorKeymaps {
    private keybinds: KeyBinds<EditorAction>;

    constructor() {
        this.keybinds = new KeyBinds<EditorAction>(
            DefaultMap,
            ActionHandlers
        );
    }

    enable(_: Listenable) {
        this.keybinds.enabled = true;
    }

    disable() {
        this.keybinds.enabled = false;
    }

    register(seq: string, action: EditorAction) {
        this.keybinds.registerSequence(seq, action);
    }

    resolveEvent(e: React.KeyboardEvent) {
        return this.keybinds.resolveEvent({
            charcode: e.keyCode,
            code: getCodeWorkaround(e),
            ctrlKey: isCtrlKeyCommand(e),
            altKey: isOptionKeyCommand(e),
            metaKey: hasCommandModifier(e),
            shiftKey: false,  // Note: Editor handles shift key so we can't use it
        });
    }

    handleAction(name: string | EditorAction) {
        if (isEditorAction(name)) {
            return this.keybinds.handleAction(name);
        }
        return false;
    }

    // Note:
    // draft-js distinguish 'Return' keydown event from other keydown events

    resolveReturnAction(e: React.KeyboardEvent) {
        return this.keybinds.resolveEvent({
            charcode: 13,
            code: 'Enter',
            ctrlKey: isCtrlKeyCommand(e),
            altKey: isOptionKeyCommand(e),
            metaKey: hasCommandModifier(e),
            shiftKey: false,
        });
    }

    handleReturn(e: React.KeyboardEvent) {
        const resolved = this.resolveReturnAction(e);
        if (resolved === null) {
            return false;
        }

        log.debug('Return key event is resolved to ', resolved);

        this.keybinds.handleAction(resolved);
        return true;
    }
}


