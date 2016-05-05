interface NotificationConfig {
    reply: boolean;
    retweet: boolean;
    quoted: boolean;
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
