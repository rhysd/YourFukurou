import {List} from 'immutable';
import {Twitter} from 'twit';
import Item from './item';
import Store from '../store';
import {TimelineKind} from '../states/timeline';
import Tweet from '../item/tweet';
import TwitterRestApi from '../twitter/rest_api';
import {completeMissingStatuses} from '../actions';
import log from '../log';

function getMissingTweets(kind: TimelineKind, max_id: string, since_id: string) {
    switch (kind) {
        case 'home':
            return TwitterRestApi.missingHomeTimeline(max_id, since_id);
        case 'mention':
            return TwitterRestApi.missingMentionTimeline(max_id, since_id);
        default:
            return Promise.resolve([] as Twitter.Status[]);
    }
}

export default class Separator implements Item {
    // Note:
    // Should getting missing status at specific index of timeline be moved to TwitterRestApi class?
    static getMissingItemsAt(sep_index: number, kind: TimelineKind, current_items: List<Item>) {
        const size = current_items.size;

        let before: Tweet = null;
        let after: Tweet = null;

        let idx = sep_index - 1;
        while (idx >= 0) {
            const t = current_items.get(idx);
            if (t instanceof Tweet) {
                before = t;
                break;
            }
            --idx;
        }

        idx = sep_index + 1;
        while (idx < size) {
            const t = current_items.get(idx);
            if (t instanceof Tweet) {
                after = t;
                break;
            }
            ++idx;
        }

        const max_id = before ? before.id : undefined;
        const since_id = after ? after.id : undefined;

        log.debug('Will obtain missing statuses in timeline:', max_id, since_id);

        return getMissingTweets(kind, max_id, since_id).then(tweets => {
            if (tweets.length === 0) {
                return [] as Item[];
            }

            const items = tweets.map(json => new Tweet(json) as Item);

            if (tweets[0].id_str === max_id) {
                // Note:
                // 'max_id' status duplicates because it is included in response.
                items.shift();
                if (items.length === 0) {
                    return [] as Item[];
                }
            } else {
                log.error('First status of missing statuses sequence is not a max_id status', items);
            }

            // Note:
            // When all missing statuses are not completed.
            items.push(new Separator());

            return items;
        });
    }

    static dispatchMissingStatusesAt(sep_index: number) {
        const timeline = Store.getState().timeline;
        const kind = timeline.kind;
        const items = timeline.getCurrentTimeline();
        Separator.getMissingItemsAt(sep_index, kind, items).then(missings => {
            // Note:
            // Dispatch action even if no status was returned because of removing the separator.
            log.debug('Missing statuses will be completed:', missings);
            Store.dispatch(completeMissingStatuses(kind, sep_index, missings));
        });
    }
}
