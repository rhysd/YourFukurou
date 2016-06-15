import * as React from 'react';
import {connect} from 'react-redux';
import {Twitter} from 'twit';
import Tweet from '../../item/tweet';
import TweetText from '../tweet/text';
import ScreenName from '../tweet/screen_name';
import {renderPicIcon} from './index';
import {openPicturePreview} from '../../actions';

interface ConnectedProps extends React.Props<any> {
    status: Tweet;
    focused: boolean;
}

interface DispatchProps {
    onClick: (e: React.MouseEvent) => void;
}

type MiniTweetTextProps = ConnectedProps & DispatchProps;

function renderQuoted(s: Tweet, focused: boolean, onClick: (e: React.MouseEvent) => void) {
    const q = s.quoted_status;
    if (q === null) {
        return undefined;
    }
    return (
        <div
            className={
                focused ?
                    'mini-tweet__quoted mini-tweet__quote_focused' :
                    'mini-tweet__quoted'
            }
            title={q.text}
        >
            <span className="mini-tweet__quoted-icon">
                <i className="fa fa-quote-left"/>
            </span>
            <ScreenName className="mini-tweet__quoted-screenname" user={q.user}/>
            <TweetText className="mini-tweet__quoted-text" status={q}/>
            {renderPicIcon(q, onClick)}
        </div>
    );
}

const MiniTweetText: React.StatelessComponent<MiniTweetTextProps> = props => {
    const tw = props.status.getMainStatus();
    return (
        <div className="mini-tweet__text" title={tw.text}>
            <TweetText status={tw} focused={props.focused}/>
            {renderQuoted(tw, props.focused, props.onClick)}
        </div>
    );
};

function mapDispatch(dispatch: Redux.Dispatch, props: ConnectedProps): DispatchProps {
    return {
        onClick: e => {
            e.stopPropagation();
            const urls = props.status.getMainStatus().media.map(m => m.media_url);
            dispatch(openPicturePreview(urls));
        },
    };
}

export default connect(null, mapDispatch)(MiniTweetText);
