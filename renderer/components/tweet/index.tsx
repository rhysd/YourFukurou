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
    openConversationTimeline,
} from '../../actions';
import TwitterRestApi from '../../twitter/rest_api';

// Note:
// This showConversation() function has some limitations.
// 1. Can't take statuses from protected accounts.  This is because of spec of search/tweets.
// 2. Can't take statuses older than a week.  This is because of the same as above.
// 3. Can't take statuses from third person in conversation.  For example, @A talks with @B starting
//    from @A's tweet.  Then @C replies to @B tweet in the conversation.  But search/tweets doesn't
//    include @C's tweets in the situation.
//
// TODO:
// We can also use timeline cache on memory to find out related statuses to the conversation.
export function showConversation(status: TweetItem, dispatch: Redux.Dispatch) {
    TwitterRestApi.conversationStatuses(status.id, status.user.screen_name)
        .then(json => {
            const statuses = json.map(s => new TweetItem(s));
            statuses.push(status);
            Array.prototype.push.apply(statuses, status.related_statuses);
            dispatch(openConversationTimeline(statuses));
        });
}

interface ConnectedProps extends React.Props<any> {
    status: TweetItem;
    owner: TwitterUser;
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
            const action = props.focused ?
                unfocusItem() : focusOnItem(props.itemIndex);
            dispatch(action);
        },
        onClickConversation: e => {
            e.stopPropagation();
            showConversation(props.status.getMainStatus(), dispatch);
        },
    };
}

export default connect(null, mapDispatch)(Tweet);
