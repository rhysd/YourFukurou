export var ActionKind = {
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

