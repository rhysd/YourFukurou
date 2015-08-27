import * as fs from "fs";
import * as path from "path";
import * as app from "app";

interface State {
    bounds: GitHubElectron.Rectangle;
    devtools: {
        opened: boolean;
    };
}

export default class WindowState {
    info_path: string;
    state: State;

    constructor() {
        this.info_path = path.join(app.getPath("userData"), "state-info.json");
        this.state = null;
        try {
            this.state = JSON.parse(fs.readFileSync(this.info_path, "utf8"));
        }
        catch(e) {
            console.log("StateHandler: " + e.message);
            this.state = null;
        }
    }

    restoreBounds(fallback: GitHubElectron.Rectangle) {
        if (this.state !== null && this.state.bounds) {
            return this.state.bounds;
        } else {
            return fallback;
        }
    }

    restoreDevTools(win: GitHubElectron.BrowserWindow) {
        if (this.state === null) {
            return;
        }
        if (this.state.devtools && this.state.devtools.opened) {
            win.openDevTools();
        }
    }

    saveBounds(win: GitHubElectron.BrowserWindow) {
        const saved = {
            bounds: win.getBounds(),
            devtools: {
                opened: win.isDevToolsOpened(),
            },
        };
        fs.writeFileSync(this.info_path, JSON.stringify(saved), {encoding: "utf8"});
    }
}
