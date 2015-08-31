export var ActionKind = {
    OpenLinks: Symbol("twitter-open-link"),
    AddStatus: Symbol("twitter-add-status")
};

export function openLink(id) {
    console.log('dispatched!: ', id);
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
