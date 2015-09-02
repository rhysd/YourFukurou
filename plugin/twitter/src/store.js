import EventEmitter from "events";
import {ActionKind} from "./actions";

const openExternal = global.require("shell").openExternal;

class TweetStatusStore extends EventEmitter {
    constructor() {
        super();
        this.statuses = {};
        this.setMaxListeners(0);
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

            store.emit("open-link-received", action.id);
            _openAllLinksInTweet(status);
            break;
        }
        case ActionKind.DumpCurrentStatus: {
            console.log("DumpCurrentStatus: " + action.id);
            console.log(JSON.stringify(store.getStatus(action.id), null, 2));
            break;
        }
        case ActionKind.TogglePreview: {
            store.emit("toggle-preview-received", action.id);
            break;
        }
        default:
            break;
    }
});
