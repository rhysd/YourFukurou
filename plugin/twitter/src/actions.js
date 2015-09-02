export var ActionKind = {
    OpenLinks: Symbol("twitter-open-link"),
    AddStatus: Symbol("twitter-add-status"),
    DumpCurrentStatus: Symbol("twitter-dump-current-status")
};

export function openLink(id) {
    StreamApp.dispatcher.dispatch({
        type: ActionKind.OpenLinks,
        id: id
    });
}

export function addStatus(id, status) {
    StreamApp.dispatcher.dispatch({
        type: ActionKind.AddStatus,
        id: id,
        status: status
    });
}

export function dumpCurrentStatus(id) {
    StreamApp.dispatcher.dispatch({
        type: ActionKind.DumpCurrentStatus,
        id: id
    });
}
