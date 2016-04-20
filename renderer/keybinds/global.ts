import * as I from 'immutable';
import KeyBinds from './keybinds';

export type GlobalAction = 'open-tweet-form';

const DefaultMap = I.Map<string, GlobalAction>({
    'tab': 'open-tweet-form',
});

const ActionHandlers = I.Map<GlobalAction, () => void>({
    'open-tweet-form': () => console.error('TODO'),
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
            return;
        }

        this.keybinds.handleAction(resolved);
    }
}
