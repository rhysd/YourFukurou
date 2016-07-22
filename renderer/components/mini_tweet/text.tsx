import * as React from 'react';
import {connect} from 'react-redux';
import * as classNames from 'classnames';
import Tweet from '../../item/tweet';
import TweetText from '../tweet/text';
import ScreenName from '../tweet/screen_name';
import {renderPicIcon} from './index';
import {openPicturePreview} from '../../actions/tweet_media';
import {Dispatch} from '../../store';

interface ConnectedProps extends React.Props<any> {
    readonly status: Tweet;
    readonly focused: boolean;
}

interface DispatchProps {
    readonly onClick: (e: React.MouseEvent) => void;
}

type MiniTweetTextProps = ConnectedProps & DispatchProps;

function renderQuoted(s: Tweet, focused: boolean, onClick: (e: React.MouseEvent) => void) {
    const q = s.quoted_status;
    if (q === null) {
        return undefined;
    }

    return (
        <div
            className={classNames(
                'mini-tweet__quoted',
                {'mini-tweet__quote_focused': focused},
            )}
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

export const MiniTweetText = (props: MiniTweetTextProps) => {
    const tw = props.status.getMainStatus();
    return (
        <div className="mini-tweet__text" title={tw.text}>
            <TweetText status={tw} focused={props.focused}/>
            {renderQuoted(tw, props.focused, props.onClick)}
        </div>
    );
};

function mapDispatch(dispatch: Dispatch, props: ConnectedProps): DispatchProps {
    return {
        onClick: e => {
            e.stopPropagation();
            const urls = props.status.getMainStatus().media.map(m => m.media_url);
            dispatch(openPicturePreview(urls));
        },
    };
}

export default connect(null, mapDispatch)(MiniTweetText);
