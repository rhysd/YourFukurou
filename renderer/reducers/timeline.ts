import {List} from 'immutable';
import assign = require('object-assign');
import {Action, Kind} from '../actions';
import log from '../log';
import Item from '../item/item';
import Tweet, {TwitterUser} from '../item/tweet';
import Separator from '../item/separator';
import TimelineKind from '../timeline';

function updateStatus(items: List<Item>, status: Tweet) {
    'use strict';
    return items.map(item => {
        if (item instanceof Tweet) {
            const id = item.getMainStatus().id;
            if (id === status.id) {
                if (item.isRetweet()) {
                    const cloned = item.clone();
                    cloned.json.retweeted_status = status.json;
                    return cloned;
                } else {
                    return status;
                }
            }
        }
        return item;
    }).toList();
}

// This should be done in TimelineManager
function replaceStatusInTimeline(state: TimelineState, status: Tweet) {
    'use strict';
    state.home_timeline = updateStatus(state.home_timeline, status);
    state.mention_timeline = updateStatus(state.mention_timeline, status);
    state.current_items = getCurrentTimeline(state);
    return state;
}

function containsStatusInTimeline(is: List<Item>, t: Tweet) {
    'use strict';
    return is.find(i => {
        if (i instanceof Tweet) {
            return i.id === t.id;
        } else {
            return false;
        }
    });
}

function getCurrentTimeline(state: TimelineState) {
    'use strict';
    switch (state.current_timeline) {
        case 'home': return state.home_timeline;
        case 'mention': return state.mention_timeline;
        default:
            log.error('Invalid timeline for:', state.current_timeline);
            return null;
    }
}

export interface TimelineState {
    current_items: List<Item>;
    current_message: MessageInfo;
    current_user: TwitterUser;
    current_timeline: TimelineKind;
    home_timeline: List<Item>;
    mention_timeline: List<Item>;
}

const InitTimelineState: TimelineState = {
    current_items: List<Item>(),
    current_message: null,
    current_user: null,
    current_timeline: 'home',
    home_timeline: List<Item>(),
    mention_timeline: List<Item>(),
};

export default function timeline(state: TimelineState = InitTimelineState, action: Action) {
    'use strict';
    switch (action.type) {
        case Kind.AddTweetToTimeline: {
            const next_state = assign({}, state) as TimelineState;
            next_state.home_timeline = state.home_timeline.unshift(action.status);
            if (action.status.mentionsTo(state.current_user)) {
                next_state.mention_timeline = state.mention_timeline.unshift(action.status);
            }
            next_state.current_items = getCurrentTimeline(next_state);
            return next_state;
        }
        case Kind.AddSeparator: {
            const next_state = assign({}, state) as TimelineState;
            if (!(state.current_items.first() instanceof Separator)) {
                next_state.current_items = state.current_items.unshift(action.item);
            }
            if (!(state.home_timeline.first() instanceof Separator)) {
                next_state.home_timeline = state.home_timeline.unshift(action.item);
            }
            if (!(state.mention_timeline.first() instanceof Separator)) {
                next_state.mention_timeline = state.mention_timeline.unshift(action.item);
            }
            return next_state;
        }
        case Kind.ChangeCurrentTimeline: {
            if (action.timeline === state.current_timeline) {
                return state;
            }
            const next_state = assign({}, state) as TimelineState;
            next_state.current_timeline = action.timeline;
            next_state.current_items = getCurrentTimeline(next_state);
            return next_state;
        }
        case Kind.DeleteStatus: {
            const id = action.tweet_id;
            const next_state = assign({}, state) as TimelineState;
            next_state.current_items = state.current_items.filter(
                item => {
                    if (item instanceof Tweet) {
                        const s = item.getMainStatus();
                        if (s.id === id) {
                            log.debug('Deleted status:', s);
                            return false;
                        }
                    }
                    return true;
                }
            ).toList();
            return next_state;
        }
        case Kind.AddMentions: {
            const next_state = assign({}, state) as TimelineState;
            const added = List<Item>(
                action.mentions.filter(
                    m => !containsStatusInTimeline(state.mention_timeline, m)
                )
            );
            next_state.mention_timeline = added.concat(state.mention_timeline).toList();
            next_state.current_items = getCurrentTimeline(next_state);
            return next_state;
        }
        case Kind.RetweetSucceeded: {
            const next_state = assign({}, state) as TimelineState;
            return replaceStatusInTimeline(next_state, action.status.getMainStatus());
        }
        case Kind.UnretweetSucceeded: {
            const next_state = assign({}, state) as TimelineState;
            return replaceStatusInTimeline(next_state, action.status);
        }
        case Kind.LikeSucceeded: {
            const next_state = assign({}, state) as TimelineState;
            return replaceStatusInTimeline(next_state, action.status);
        }
        case Kind.UnlikeSucceeded: {
            const next_state = assign({}, state) as TimelineState;
            return replaceStatusInTimeline(next_state, action.status);
        }
        case Kind.ShowMessage: {
            const next_state = assign({}, state) as TimelineState;
            next_state.current_message = {
                text: action.text,
                kind: action.msg_kind,
            };
            return next_state;
        }
        case Kind.DismissMessage: {
            const next_state = assign({}, state) as TimelineState;
            next_state.current_message = null;
            return next_state;
        }
        case Kind.SetCurrentUser: {
            const next_state = assign({}, state) as TimelineState;
            next_state.current_user = action.user;
            return next_state;
        }
        default: {
            return state;
        }
    }
}

