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
    plugin: string[];
    mute: boolean | MuteConfig;
}
