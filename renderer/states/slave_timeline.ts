import {List} from 'immutable';
import Item from '../item/item';
import Tweet, {TwitterUser} from '../item/tweet';
import SlaveTimelineKeymaps from '../keybinds/slave_timeline';
import GlobalKeymaps from '../keybinds/global';

interface SlaveTimeline {
    close(): SlaveTimeline;
}
export default SlaveTimeline;

export class UserTimeline implements SlaveTimeline {
    constructor(
        public user: TwitterUser,
        public items: List<Item> = List<Item>(),
        public focus_index: number = null,
        public keybinds: SlaveTimelineKeymaps = new SlaveTimelineKeymaps
    ) {
        GlobalKeymaps.disable();
        keybinds.enable(window);
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
}

// TODO:
// export class ConversationTimeline
