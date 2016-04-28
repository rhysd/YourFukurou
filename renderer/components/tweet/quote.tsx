import * as React from 'react';
import TweetItem from '../../item/tweet';
import ScreenName from './screen_name';
import TweetIcon from './icon';
import {openExternalLink} from './external-link';

interface QuotedTweetProps extends React.Props<QuotedTweet> {
    status: TweetItem;
}

export default class QuotedTweet extends React.Component<QuotedTweetProps, {}> {
    text_elem: HTMLElement;

    componentDidMount() {
        Array.prototype.forEach.call(this.text_elem.querySelectorAll("a"), (a: HTMLElement) => {
            a.className = 'external-link';
            a.style.color = '#eeeeee';
            a.onclick = openExternalLink;
        });
    }

    render() {
        const s = this.props.status.getMainStatus();
        return <div className="tweet__quoted">
            <div className="tweet__quoted-screenname">
            <i
                className="fa fa-quote-left"
                style={{marginRight: '4px'}}
            /> from <ScreenName
                user={s.user}
                color="#777777"
            />
            </div>
            <div
                className="tweet__quoted-text"
                dangerouslySetInnerHTML={{__html: s.buildLinkedHTML()}}
                ref={r => { this.text_elem = r; }}
            />
        </div>
    }
}

