import * as React from 'react';
import {connect} from 'react-redux';
import * as classNames from 'classnames';
import {TimelineKind} from '../states/timeline';
import Tweet from '../item/tweet';
import Store from '../store';
import TwitterRestApi from '../twitter/rest_api';

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
            return TwitterRestApi.missingHomeTimeline(max_id, since_id).then(json => json.map(j => new Tweet(j)));
        case 'mention':
            return TwitterRestApi.missingMentionTimeline(max_id, since_id).then(json => json.map(j => new Tweet(j)));
        default:
            return Promise.resolve([] as Tweet[]);
    }
}

function dispatchCompleteTimeline(sep_index: number, timelineKind: TimelineKind, dispatch: Redux.Dispatch) {
    const tl = Store.getState().timeline.getCurrentTimeline();
    const size = tl.size();

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

    getMissingTweets(
        timelineKind,
        before ? before.id : undefined,
        after ? after.id : undefined
    ).then(statuses => {
        if (statuses.length === 0) {
            return;
        }
        // TODO:
        // Trim statuses whose id matches to 'max_id' and 'since_id'.

        // TODO:
        // dispatch(completeMissingStatuses(...));
    });

}

function mapDispatch(dispatch: Redux.Dispatch, props: ConnectedProps): DispatchProps {
    return {
        onClick: e => {
            e.stopPropagation();
            if (props.itemIndex !== undefined && props.timelineKind !== undefined) {
                dispatchCompleteTimeline(props.itemIndex, props.timelineKind, dispatch);
            }
        },
    };
}

export default connect(null, mapDispatch)(ZigZagSeparator);
