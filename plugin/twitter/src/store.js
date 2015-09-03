import EventEmitter from "events";
import {ActionKind} from "./actions";

class Store extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(0);
    }
}

let store = new Store();
export default store;

store.dispatch_token = StreamApp.dispatcher.register(action => {
    switch(action.type) {
        case ActionKind.OpenLinks: {
            store.emit("open-links-received", action.id);
            break;
        }
        case ActionKind.DumpCurrentStatus: {
            store.emit("dump-current-status-received", action.id);
            break;
        }
        case ActionKind.TogglePreview: {
            store.emit("toggle-preview-received", action.id);
            break;
        }
        case ActionKind.SendReply: {
            store.emit("send-reply-received", action.id);
            break;
        }
        case ActionKind.SendTweet: {
            store.emit("send-tweet-received", action.id);
            break;
        }
        default:
            break;
    }
});
