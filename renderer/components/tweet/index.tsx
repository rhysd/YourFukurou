import * as React from 'react';
import {connect} from 'react-redux';
import {List} from 'immutable';
import TweetItem, {TwitterUser} from '../../item/tweet';
import TweetPrimary from './primary';
import TweetSecondary from './secondary';
import PopupIcon from './popup_icon';
import UndraggableClickable from '../undraggable_clickable';
import {TimelineKind} from '../../states/timeline';
import {Dispatch} from '../../store';
import {
    focusOnItem,
    unfocusItem,
    focusSlaveOn,
    blurSlaveTimeline,
    openConversationTimeline,
} from '../../actions';

interface ConnectedProps extends React.Props<any> {
    readonly status: TweetItem;
    readonly owner: TwitterUser;
    readonly inSlaveTimeline?: boolean;
    readonly timeline?: TimelineKind;
    readonly focused?: boolean;
    readonly related?: boolean;
    readonly focusedUser?: boolean;
    readonly friends?: List<number>;
    readonly itemIndex?: number;
}

interface DispatchProps {
    readonly onClick: (e: React.MouseEvent) => void;
    readonly onClickConversation: (e: React.MouseEvent) => void;
}

type TweetProps = ConnectedProps & DispatchProps;

function getModifier(tw: TweetItem, props: TweetProps) {
    if (props.focused) {
        return 'tweet__body_focused';
    }

    const timeline = props.timeline || 'home';
    if (tw.mentionsTo(props.owner) && timeline !== 'mention') {
        return 'tweet__body_mention';
    }

    if (props.related) {
        return 'tweet__body_related';
    }

    if (props.focusedUser) {
        return 'tweet__body_user-related';
    }

    return '';
}

const Tweet = (props: TweetProps) => {
    const tw = props.status.getMainStatus();
    const focused = !!props.focused;
    return (
        <UndraggableClickable
            className={'tweet__body ' + getModifier(tw, props)}
            onClick={props.onClick}
        >
            <PopupIcon user={tw.user} friends={props.friends}/>
            <TweetSecondary status={props.status} focused={focused}/>
            <TweetPrimary
                status={props.status}
                owner={props.owner}
                onClickConversation={props.onClickConversation}
                focused={focused}
            />
        </UndraggableClickable>
    );
};

function mapDispatch(dispatch: Dispatch, props: ConnectedProps): DispatchProps {
    return {
        onClick: e => {
            e.stopPropagation();
            if (props.itemIndex === undefined) {
                return;
            }
            const focused = !!props.focused;
            if (props.inSlaveTimeline) {
                const action = focused ?
                    blurSlaveTimeline() : focusSlaveOn(props.itemIndex);
                dispatch(action);
            } else {
                const action = focused ?
                    unfocusItem() : focusOnItem(props.itemIndex);
                dispatch(action);
            }
        },
        onClickConversation: e => {
            e.stopPropagation();
            dispatch(openConversationTimeline(props.status.getMainStatus()));
        },
    };
}

export default connect(null, mapDispatch)(Tweet);
