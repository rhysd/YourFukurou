import Tweet from '../item/tweet';
import log from '../log';
import {updateStatus} from '../actions';
import Store from '../store';

function editReply(text: string, in_reply_to_status_id: string) {
    'use strict';
    Store.dispatch(updateStatus(text, in_reply_to_status_id));
}

function createNotification(tw: Tweet, title: string) {
    'use strict';
    const n = new Notification(title, {
        icon: tw.user.icon_url,
        body: tw.text,
    });

    n.addEventListener('click', () => editReply(tw.user.screen_name + ' ', tw.id));
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
    const owner = Store.getState().timeline.user;
    if (tw.in_reply_to_user_id === owner.id) {
        notifyReply(tw);
    } else if (tw.isRetweet() && tw.retweeted_status.user.id === owner.id) {
        notifyRetweet(tw);
    } else if (tw.isQuotedTweet() && tw.quoted_status.user.id === owner.id) {
        notifyQuoted(tw);
    }
}
