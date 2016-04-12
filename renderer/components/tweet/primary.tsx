import * as React from 'react';
import {autoLink, htmlEscape} from 'twitter-text';
import {openExternalLink} from './external-link';

interface TweetPrimaryProps extends React.Props<any> {
    status: TweetStatus;
}

export default class TweetPrimary extends React.Component<TweetPrimaryProps, {}> {
    body: HTMLElement;

    componentDidMount() {
        Array.prototype.forEach.call(this.body.querySelectorAll("a"), (a: HTMLElement) => {
            a.className = 'external-link';
            a.onclick = openExternalLink;
        });
    }

    getEntities() {
        if (!this.props.status.entities) {
            return [];
        }
        let es = this.props.status.entities;
        let ret: any[] = [];
        const push = Array.prototype.push;
        if (es.urls) {
            push.apply(ret, es.urls);
        }
        if (es.hashtags) {
            push.apply(ret, es.hashtags);
        }
        if (es.user_mentions) {
            for (const m of es.user_mentions) {
                (m as any).screenName = m.screen_name;
            }
            push.apply(ret, es.user_mentions);
        }
        return ret;
    }

    buildHTML() {
        return autoLink(htmlEscape(this.props.status.text), this.getEntities());
    }

    render() {
        return <div
            className="tweet__primary"
            ref={ref => { this.body = ref; }}
            dangerouslySetInnerHTML={{__html: this.buildHTML()}}
        />;
    }
}

