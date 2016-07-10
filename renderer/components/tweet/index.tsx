import * as React from 'react';
import {connect} from 'react-redux';
import {List} from 'immutable';
import TweetItem, {TwitterUser} from '../../item/tweet';
import TweetPrimary from './primary';
import TweetSecondary from './secondary';
import PopupIcon from './popup_icon';
import UndraggableClickable from '../undraggable_clickable';
import State from '../../states/root';
import {TimelineKind} from '../../states/timeline';
import {
    focusOnItem,
    unfocusItem,
    focusSlaveOn,
    blurSlaveTimeline,
    openConversationTimeline,
} from '../../actions';
import log from '../../log';

interface ConnectedProps extends React.Props<any> {
    status: TweetItem;
    owner: TwitterUser;
    inSlaveTimeline?: boolean;
    timeline?: TimelineKind;
    focused?: boolean;
    related?: boolean;
    focused_user?: boolean;
    friends?: List<number>;
    itemIndex?: number;
}

interface DispatchProps {
    onClick: (e: React.MouseEvent) => void;
    onClickConversation: (e: React.MouseEvent) => void;
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

    if (props.focused_user) {
        return 'tweet__body_user-related';
    }

    return '';
}

const Tweet: React.StatelessComponent<TweetProps> = props => {
    const tw = props.status.getMainStatus();
    return (
        <UndraggableClickable
            className={'tweet__body ' + getModifier(tw, props)}
            onClick={props.onClick}
        >
            <PopupIcon user={tw.user} friends={props.friends}/>
            <TweetSecondary status={props.status} focused={props.focused}/>
            <TweetPrimary
                status={props.status}
                owner={props.owner}
                onClickConversation={props.onClickConversation}
                focused={props.focused}
            />
        </UndraggableClickable>
    );
};

function mapDispatch(dispatch: Redux.Dispatch, props: ConnectedProps): DispatchProps {
    return {
        onClick: e => {
            e.stopPropagation();
            if (props.itemIndex === undefined) {
                return;
            }
            if (props.inSlaveTimeline) {
                const action = props.focused ?
                    blurSlaveTimeline() : focusSlaveOn(props.itemIndex);
                dispatch(action);
            } else {
                const action = props.focused ?
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
