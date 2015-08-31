import {ActionKind} from "./actions";

const openExternal = global.require("shell").openExternal;

class TweetStatusStore {
    constructor() {
        this.statuses = {};
    }

    getAll() {
        return this.statuses;
    }

    getStatus(id) {
        return this.statuses[id];
    }
}

let store = new TweetStatusStore();
export default store;

function _openAllLinksInTweet(status) {
    for (const url of status.entities.urls) {
        openExternal(url.expanded_url);
    }
}

store.dispatch_token = StreamApp.dispatcher.register(action => {
    switch(action.type) {
        case ActionKind.AddStatus: {
            store.statuses[action.id] = action.status;
            break;
        }
        case ActionKind.OpenLinks: {
            let status = store.getStatus(action.id);
            if (status === undefined) {
                break;
            }

            _openAllLinksInTweet(status);
            break;
        }
        default:
            break;
    }
});
