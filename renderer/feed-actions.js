import {ActionKind} from "./constants";
import Dispatcher from "./dispatcher";

export function addItem(id, init) {
    Dispatcher.dispatch({
        type: ActionKind.AddItem,
        id: id,
        val: init
    });
}

export function focusTo(new_id) {
    Dispatcher.dispatch({
        type: ActionKind.FocusTo,
        id: new_id
    });
}

export function focusNext() {
    Dispatcher.dispatch({
        type: ActionKind.FocusNext
    });
}

export function focusPrev() {
    Dispatcher.dispatch({
        type: ActionKind.FocusPrev
    });
}

export function focusFirst() {
    Dispatcher.dispatch({
        type: ActionKind.FocusFirst
    });
}

export function focusLast() {
    Dispatcher.dispatch({
        type: ActionKind.FocusLast
    });
}

export function blur() {
    Dispatcher.dispatch({
        type: ActionKind.Blur
    });
}
