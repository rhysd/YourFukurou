import {ActionKind} from "./actions";

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

store.dispatch_token = StreamApp.dispatcher.register(action => {
    console.log('twitter store: action: ', action);
    switch(action.type) {
        case ActionKind.AddStatus: {
            store.statuses[action.id] = action.status;
            break;
        }
        case ActionKind.OpenLinks: {
            let status = store.getStatus(action.id);
            console.log("action fired!!: ", status);
            if (status === undefined) {
                break;
            }

            break;
        }
        default:
            break;
    }
});
