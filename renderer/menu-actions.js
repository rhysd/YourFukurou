import {ActionKind} from "./constants";
import Dispatcher from "./dispatcher";

export function addMenuItem(name, menu_item, menu_body) {
    Dispatcher.dispatch({
        type: ActionKind.AddMenuItem,
        name: name,
        item: menu_item,
        body: menu_body
    });
}

export function toggleMenu() {
    Dispatcher.dispatch({
        type: ActionKind.ToggleMenu
    });
}
