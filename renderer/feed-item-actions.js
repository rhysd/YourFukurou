import {ActionKind} from "./constants";
import Dispatcher from "./dispatcher";

export function updateWholeItem(id, new_item) {
    Dispatcher.dispatch({
        type: ActionKind.UpdateWholeItem,
        id: id,
        updated: new_item
    });
}

export function updateItem(id, key, value) {
    Dispatcher.dispatch({
        type: ActionKind.UpdateItem,
        id: id,
        key: key,
        value: value
    });
}
