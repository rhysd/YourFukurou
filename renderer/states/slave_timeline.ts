import {List} from 'immutable';
import Item from '../item/item';
import Tweet, {TwitterUser} from '../item/tweet';
import Separator from '../item/separator';
import log from '../log';

// TODO:
// moving focus is common operation.  They should be defined in parent class.
export interface SlaveTimeline {
    getFocusedItem(): Item | null;
    focusNext(): SlaveTimeline;
    focusPrev(): SlaveTimeline;
    focusTop(): SlaveTimeline;
    focusBottom(): SlaveTimeline;
    focusOn(index: number | null): SlaveTimeline;
    blur(): SlaveTimeline;
    getTitle(): string;
}

export class UserTimeline implements SlaveTimeline {
    constructor(
        public readonly user: TwitterUser,
        public readonly items: List<Item> = List<Item>([new Separator()]),
        public readonly focus_index: number | null = null,
    ) {}

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
            focus_idx,
        );
    }

    appendPastItems(items: Item[]) {
        const next_items = this.items.splice(this.items.size - 1, 1, ...items).toList();
        return new UserTimeline(
            this.user,
            next_items,
            this.focus_index,
        );
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
            idx,
        );
    }

    getTitle() {
        return `Profile: @${this.user.screen_name}`;
    }
}

export class ConversationTimeline implements SlaveTimeline {
    static fromArray(statuses: Tweet[]) {
        return new ConversationTimeline(List<Tweet>(statuses));
    }

    constructor(
        public readonly items: List<Tweet>,
        public readonly focus_index: number | null = null,
    ) {}

    getFocusedItem() {
        if (this.focus_index === null) {
            return null;
        }
        return this.items.get(this.focus_index);
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
            idx,
        );
    }

    getTitle() {
        return 'Conversation';
    }
}

export default class SlaveTimelineState {
    constructor(
        public readonly timeline_stack: List<SlaveTimeline>,
    ) {}

    openUserTimeline(user: TwitterUser) {
        return new SlaveTimelineState(
            this.timeline_stack.push(new UserTimeline(user))
        );
    }

    openConversationTimeline(statuses: Tweet[]) {
        return new SlaveTimelineState(
            this.timeline_stack.push(ConversationTimeline.fromArray(statuses))
        );
    }

    closeCurrentTimeline() {
        if (this.timeline_stack.size === 0) {
            log.error('Try to back from empty slave timeline!: ', this);
            return this;
        }
        return new SlaveTimelineState(List<SlaveTimeline>());
    }

    backToPreviousTimeline() {
        if (this.timeline_stack.size <= 1) {
            log.warn('Maybe invalid slave timeline state: Trying to back to empty:', this);
            return this.closeCurrentTimeline();
        }
        return new SlaveTimelineState(this.timeline_stack.pop());
    }

    getCurrent() {
        return this.timeline_stack.last() || null;
    }

    modifyUserTimeline(user_id: number, modifier: (u: UserTimeline) => UserTimeline) {
        const current = this.timeline_stack.last();
        if (current === undefined) {
            return this;
        }
        if (!(current instanceof UserTimeline)) {
            return this;
        }
        if (current.user.id !== user_id) {
            return this;
        }
        const modified = modifier(current);
        if (modified === current) {
            return this;
        }
        return new SlaveTimelineState(this.timeline_stack.set(-1, modified));
    }

    modifySlaveTimeline(modifier: (s: SlaveTimeline) => SlaveTimeline) {
        const current = this.timeline_stack.last();
        if (current === undefined) {
            return this;
        }
        const modified = modifier(current);
        if (modified === current) {
            return this;
        }
        return new SlaveTimelineState(this.timeline_stack.set(-1, modified));
    }
}

export const DefaultSlaveTimelineState = new SlaveTimelineState(List<SlaveTimeline>());

