import Tweet, {TwitterUser} from '../item/tweet';
import log from '../log';
import PM from '../plugin_manager';
import AppConfig from '../config';

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

    n.addEventListener('error', err => log.error('Error on notification:', err, n));

    return n;
}
