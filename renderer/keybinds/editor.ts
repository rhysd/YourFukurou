import KeyBinds from './keybinds';
import * as I from 'immutable';
import * as React from 'react';
import {KeyBindingUtil} from 'draft-js';

const {
    hasCommandModifier,
    isCtrlKeyCommand,
    isOptionKeyCommand,
} = KeyBindingUtil;

export type EditorAction = 'send-tweet';

const DefaultMap = I.Map<string, EditorAction>({
    'ctrl+enter': 'send-tweet',
});

function isEditorAction(s: string): s is EditorAction {
    'use strict';
    return s === 'send-tweet';
}

// TODO:
// This is imported from neovim-component.  It should be reworked.
function getCodeWorkaround(key_code: number) {
    'use strict';
    switch (key_code) {
        case 0:   return 'Nul';
        case 8:   return 'BS';
        case 9:   return 'Tab';
        case 10:  return 'NL';
        case 13:  return 'Enter';
        case 33:  return 'PageUp';
        case 34:  return 'PageDown';
        case 27:  return 'Esc';
        case 32:  return 'Space';
        case 35:  return 'End';
        case 36:  return 'Home';
        case 37:  return 'Left';
        case 38:  return 'Up';
        case 39:  return 'Right';
        case 40:  return 'Down';
        case 45:  return 'Insert';
        case 46:  return 'Del';
        case 47:  return 'Help';
        case 92:  return 'Bslash';
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
        default:  return null;
    }
}

const ActionHandlers = I.Map<EditorAction, () => void>({
    'open-tweet-form': () => console.error('TODO'),
});

export default class EditorKeymaps {
    private keybinds: KeyBinds<EditorAction>;

    constructor() {
        this.keybinds = new KeyBinds<EditorAction>(
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

    register(seq: string, action: EditorAction) {
        this.keybinds.registerSequence(seq, action);
    }

    resolveEvent(e: React.KeyboardEvent) {
        return this.keybinds.resolveEvent({
            charcode: e.keyCode,
            code: getCodeWorkaround(e.keyCode),
            ctrlKey: isCtrlKeyCommand(e),
            altKey: isOptionKeyCommand(e),
            metaKey: hasCommandModifier(e),
        });
    }

    handleAction(name: string | EditorAction) {
        if (isEditorAction(name)) {
            this.keybinds.handleAction(name);
        }
    }
}


