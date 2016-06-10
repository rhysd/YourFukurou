import {List} from 'immutable';
import Item from '../item/item';
import Tweet, {TwitterUser} from '../item/tweet';
import SlaveTimelineKeymaps from '../keybinds/slave_timeline';
import GlobalKeymaps from '../keybinds/global';

interface SlaveTimeline {
    close(): SlaveTimeline;
    focusNext(): SlaveTimeline;
    focusPrev(): SlaveTimeline;
    focusTop(): SlaveTimeline;
    focusBottom(): SlaveTimeline;
    focusOn(index: number): SlaveTimeline;
    blur(): SlaveTimeline;
}
export default SlaveTimeline;

function newKeybinds() {
    'use strict';
    const keybinds = new SlaveTimelineKeymaps();
    GlobalKeymaps.disable();
    keybinds.enable(window);
    return keybinds;
}

export class UserTimeline implements SlaveTimeline {
    constructor(
        public user: TwitterUser,
        public items: List<Item> = List<Item>(),
        public focus_index: number = null,
        public keybinds: SlaveTimelineKeymaps = newKeybinds()
    ) {}

    getFocusedStatus() {
        if (this.focus_index === null) {
            return null;
        }
        const item = this.items.get(this.focus_index);
        if (item instanceof Tweet) {
            return item;
        } else {
            return null;
        }
    }

    addTweets(statuses: Tweet[]) {
        const next_items = this.items.unshift.apply(this.items, statuses);
        const focus_idx = this.focus_index === null ? null : (this.focus_index + statuses.length);
        return new UserTimeline(
            this.user,
            next_items,
            focus_idx,
            this.keybinds
        );
    }

    close(): UserTimeline {
        this.keybinds.disable();
        GlobalKeymaps.enable();
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

    focusOn(idx: number) {
        if (idx === this.focus_index) {
            return this;
        }
        return new UserTimeline(
            this.user,
            this.items,
            idx,
            this.keybinds
        );
    }
}

// TODO:
// export class ConversationTimeline
