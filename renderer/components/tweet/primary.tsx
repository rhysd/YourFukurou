import * as React from 'react';
import {autoLinkEntities, EntityWithIndices} from 'twitter-text';
import {openExternalLink} from './external-link';
import log from '../../log';

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
        let ret = [] as EntityWithIndices[];
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
        return autoLinkEntities(this.props.status.text, this.getEntities(), {
            urlEntities: this.props.status.entities.urls,
        });
    }

    createdAt() {
        const created_at = this.props.status.created_at;
        if (created_at === undefined) {
            return '';
        }
        const d = new Date(created_at);
        return `${('0' + d.getHours()).slice(-2)}:${('0' + d.getMinutes()).slice(-2)} ${d.getMonth()+1}/${d.getDate()} ${d.getFullYear()}`;
    }

    render() {
        return <div className="tweet__primary" ref={r => { this.body = r; }}>
            <div
                className="tweet__primary-text"
                dangerouslySetInnerHTML={{__html: this.buildHTML()}}
            />
            <div className="tweet__primary-createdby">
                {this.createdAt()}
            </div>
        </div>;
    }
}

