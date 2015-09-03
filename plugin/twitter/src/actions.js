export var ActionKind = {
    SendReply: Symbol("twitter-send-reply"),
    SendTweet: Symbol("twitter-send-tweet"),
    OpenLinks: Symbol("twitter-open-link"),
    DumpCurrentStatus: Symbol("twitter-dump-current-status"),
    TogglePreview: Symbol("twitter-open-preview")
};

function createKeyInputAction(type) {
    return id => {
        StreamApp.dispatcher.dispatch({
            type: type,
            id: id
        });
    };
}

export const openLinks = createKeyInputAction(ActionKind.OpenLinks);
export const dumpCurrentStatus = createKeyInputAction(ActionKind.DumpCurrentStatus);
export const togglePreview = createKeyInputAction(ActionKind.TogglePreview);
export const sendReply = createKeyInputAction(ActionKind.SendReply);
export const sendTweet = createKeyInputAction(ActionKind.SendTweet);
