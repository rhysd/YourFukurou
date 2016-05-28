interface NotificationConfig {
    reply: boolean;
    retweet: boolean;
    quoted: boolean;
    like: boolean;
}

interface MuteConfig {
    home: boolean;
    mention: boolean;
}

interface Config {
    notification: boolean | NotificationConfig;
    notification_sound: boolean | string;
    hotkey_accelerator: string;
    expand_tweet: 'always' | 'focused' | 'never';
    plugin: string[];
    mute: boolean | MuteConfig;
    proxy: string;
}
