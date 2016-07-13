import {List} from 'immutable';
import Item from '../item/item';
import Tweet, {TwitterUser} from '../item/tweet';
import Separator from '../item/separator';
import KeymapTransition from '../keybinds/keymap_transition';

interface SlaveTimeline {
    getFocusedItem(): Item | null;
    close(): null;
    focusNext(): SlaveTimeline;
    focusPrev(): SlaveTimeline;
    focusTop(): SlaveTimeline;
    focusBottom(): SlaveTimeline;
    focusOn(index: number | null): SlaveTimeline;
    blur(): SlaveTimeline;
}
export default SlaveTimeline;

export class UserTimeline implements SlaveTimeline {
    constructor(
        public user: TwitterUser,
        public items: List<Item> = List<Item>([new Separator()]),
        public focus_index: number | null = null
    ) {
        KeymapTransition.enterSlaveTimeline();
    }

    getFocusedItem() {
        if (this.focus_index === null) {
            return null;
        }
        return this.items.get(this.focus_index);
    }

    addTweets(statuses: Tweet[]) {
        const next_items = this.items.unshift.apply(this.items, statuses);
        const focus_idx = this.focus_index === null ? null : (this.focus_index + statuses.length);
        return new UserTimeline(
            this.user,
            next_items,
            focus_idx
        );
    }

    appendPastItems(items: Item[]) {
        const next_items = this.items.splice(this.items.size - 1, 1, ...items).toList();
        return new UserTimeline(
            this.user,
            next_items,
            this.focus_index
        );
    }

    close(): null {
        KeymapTransition.escapeFromCurrentKeymaps();
        return null;
    }

    blur() {
        return this.focusOn(null);
    }

    focusNext() {
        if (this.focus_index === null) {
            return this.focusOn(0);
        }
        if (this.focus_index === this.items.size - 1) {
            return this;
        }
        return this.focusOn(this.focus_index + 1);
    }

    focusPrev() {
        if (this.focus_index === null) {
            return this;
        }
        if (this.focus_index === 0) {
            return this;
        }
        return this.focusOn(this.focus_index - 1);
    }

    focusTop() {
        return this.focusOn(0);
    }

    focusBottom() {
        return this.focusOn(this.items.size - 1);
    }

    focusOn(idx: number | null) {
        if (idx === this.focus_index) {
            return this;
        }
        return new UserTimeline(
            this.user,
            this.items,
            idx
        );
    }
}

export class ConversationTimeline implements SlaveTimeline {
    static fromArray(statuses: Tweet[]) {
        return new ConversationTimeline(List<Tweet>(statuses));
    }

    constructor(
        public items: List<Tweet>,
        public focus_index: number | null = null
    ) {
        KeymapTransition.enterSlaveTimeline();
    }

    getFocusedItem() {
        if (this.focus_index === null) {
            return null;
        }
        return this.items.get(this.focus_index);
    }

    close(): null {
        KeymapTransition.escapeFromCurrentKeymaps();
        return null;
    }

    blur() {
        return this.focusOn(null);
    }

    focusNext() {
        if (this.focus_index === null) {
            return this.focusOn(0);
        }
        if (this.focus_index === this.items.size - 1) {
            return this;
        }
        return this.focusOn(this.focus_index + 1);
    }

    focusPrev() {
        if (this.focus_index === null) {
            return this;
        }
        if (this.focus_index === 0) {
            return this;
        }
        return this.focusOn(this.focus_index - 1);
    }

    focusTop() {
        return this.focusOn(0);
    }

    focusBottom() {
        return this.focusOn(this.items.size - 1);
    }

    focusOn(idx: number | null) {
        if (idx === this.focus_index) {
            return this;
        }
        return new ConversationTimeline(
            this.items,
            idx
        );
    }
}

