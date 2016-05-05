import Tweet from '../item/tweet';
import log from '../log';
import {openEditor} from '../actions';
import Store from '../store';
import PM from '../plugin_manager';
import AppConfig from '../config';

function editReply(in_reply_to: Tweet) {
    'use strict';
    Store.dispatch(openEditor(in_reply_to));
}

function createNotification(tw: Tweet, title: string) {
    'use strict';
    const n = new Notification(title, {
        icon: tw.user.icon_url,
        body: tw.text,
    });

    n.addEventListener('click', () => editReply(tw));
    n.addEventListener('error', err => log.error('Error on notification:', err));

    return n;
}

export function notifyReply(tw: Tweet) {
    'use strict';
    return createNotification(tw, `Reply from @${tw.user.screen_name}`);
}

export function notifyRetweet(rt: Tweet) {
    'use strict';
    return createNotification(rt, `Retweeted by @${rt.user.screen_name}`);
}

export function notifyQuoted(qt: Tweet) {
    'use strict';
    return createNotification(qt, `Quoted by @${qt.user.screen_name}`);
}

export default function notifyTweet(tw: Tweet) {
    'use strict';
    const owner = Store.getState().timeline.user;
    if (owner === null || PM.shouldRejectNotification(tw)) {
        return;
    }

    if (AppConfig.notification.reply && tw.in_reply_to_user_id === owner.id) {
        notifyReply(tw);
    } else if (AppConfig.notification.retweet && tw.isRetweet() && tw.retweeted_status.user.id === owner.id) {
        notifyRetweet(tw);
    } else if (AppConfig.notification.quoted && tw.isQuotedTweet() && tw.quoted_status.user.id === owner.id) {
        notifyQuoted(tw);
    }
}
