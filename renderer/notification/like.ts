import Tweet, {TwitterUser} from '../item/tweet';
import log from '../log';
import PM from '../plugin_manager';
import AppConfig from '../config';
import {changeCurrentTimeline} from '../actions';
import Store from '../store';

export default function notifyLiked(tw: Tweet, by: TwitterUser) {
    'use strict';

    if (!AppConfig.notification.like || PM.shouldRejectLikeNotification(tw, by)) {
        return null;
    }

    const n = new Notification(`Liked by @${by.screen_name}`, {
        icon: by.icon_url,
        body: tw.text,
        silent: AppConfig.notificationSilent(),
        sound: AppConfig.notificationSound(),
    });

    n.addEventListener('click', () => Store.dispatch(changeCurrentTimeline('mention')));
    n.addEventListener('error', err => log.error('Error on notification:', err, n));

    return n;
}
