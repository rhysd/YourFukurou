import * as React from 'react';
import {connect} from 'react-redux';
import * as classNames from 'classnames';
import {Twitter} from 'twit';
import {TimelineKind} from '../states/timeline';
import Tweet from '../item/tweet';
import Item from '../item/item';
import Separator from '../item/separator';
import Store from '../store';
import TwitterRestApi from '../twitter/rest_api';
import {completeMissingStatuses} from '../actions';
import log from '../log';

interface ConnectedProps extends React.Props<any> {
    itemIndex?: number;
    timelineKind?: TimelineKind;
    focused?: boolean;
}

interface DispatchProps {
    onClick: (e: React.MouseEvent) => void;
}

type ZigZagSeparatorProps = ConnectedProps & DispatchProps;

export const ZigZagSeparator = (props: ZigZagSeparatorProps) => (
    <div className="zigzag-separator" onClick={props.onClick}>
        <div className="zigzag-separator__top"/>
        <div
            className={classNames({
                'zigzag-separator__focused-middle': props.focused,
                'zigzag-separator__middle': !props.focused,
            }, 'zigzag-separator__jagged')}
        />
        <div className="zigzag-separator__bottom zigzag-separator__jagged"/>
    </div>
);

function getMissingTweets(timelineKind: TimelineKind, max_id: string, since_id: string) {
    switch (timelineKind) {
        case 'home':
            return TwitterRestApi.missingHomeTimeline(max_id, since_id);
        case 'mention':
            return TwitterRestApi.missingMentionTimeline(max_id, since_id);
        default:
            return Promise.resolve([] as Twitter.Status[]);
    }
}

function getMissingItems(sep_index: number, timelineKind: TimelineKind) {
    const tl = Store.getState().timeline.getCurrentTimeline();
    const size = tl.size;

    let before: Tweet = null;
    let after: Tweet = null;

    let idx = sep_index - 1;
    while (idx >= 0) {
        const t = tl.get(idx);
        if (t instanceof Tweet) {
            before = t;
            break;
        }
        --idx;
    }

    idx = sep_index + 1;
    while (idx < size) {
        const t = tl.get(idx);
        if (t instanceof Tweet) {
            after = t;
            break;
        }
        ++idx;
    }

    const max_id = before ? before.id : undefined;
    const since_id = after ? after.id : undefined;

    log.debug('Will obtain missing statuses in timeline:', max_id, since_id);

    return getMissingTweets(timelineKind, max_id, since_id).then(tweets => {
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

function mapDispatch(dispatch: Redux.Dispatch, props: ConnectedProps): DispatchProps {
    return {
        onClick: e => {
            e.stopPropagation();
            if (props.itemIndex !== undefined && props.timelineKind !== undefined) {
                getMissingItems(props.itemIndex, props.timelineKind).then(items => {
                    // Note:
                    // Dispatch action even if no status was returned because of removing the separator.
                    log.debug('Missing statuses will be completed:', items);
                    dispatch(completeMissingStatuses(props.timelineKind, props.itemIndex, items));
                });
            }
        },
    };
}

export default connect(null, mapDispatch)(ZigZagSeparator);
