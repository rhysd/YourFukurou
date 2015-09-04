import * as app from "app";
import BrowserWindow = require("browser-window");
import * as path from "path";
import * as fs from "fs";
import * as ipc from "ipc";
import {openExternal} from "shell";
import SourceLoader from "./source-loader";
import Source from "./source";
import WindowState from "./window-state";

require("crash-reporter").start();

// Show versions {{{
const versions: any = process.versions;
console.log("Stream version 0.0.0");
console.log("  Electron version " + versions.electron);
console.log("  Chrome version " + versions.chrome);
console.log("  io.js version " + versions.node);
// }}}

var mainWindow: GitHubElectron.BrowserWindow = null;
var react_extension_loaded = false;
global.sources = [];
var window_state = new WindowState();
global.load_paths = [
    path.join(app.getAppPath(), "plugin"),
    path.join(app.getPath("userData"), "plugin", "node_modules")
];

app.on("window-all-closed", function(){ app.quit(); });

app.on("ready", function(){
    mainWindow = new BrowserWindow(
        window_state.restoreBounds({width: 800, height: 1000})
    );

    const loader = new SourceLoader(global.load_paths, mainWindow);

    const html = "file://" + path.resolve(__dirname, "..", "..", "index.html");
    mainWindow.loadUrl(html);

    mainWindow.on("close", function(){
        window_state.saveBounds(mainWindow);
    });
    mainWindow.on("closed", function(){
        mainWindow = null;
    });

    mainWindow.on("will-navigate", function(e: Event, url: string){
        e.preventDefault();
        openExternal(url);
    });

    mainWindow.on("devtools-opened", function(){
        if (!react_extension_loaded) {
            const extension_path = path.join(__dirname, "..", "..", "devtools_extension", "react-devtools");
            if (fs.existsSync(extension_path)) {
                BrowserWindow.addDevToolsExtension(extension_path);
            }
            react_extension_loaded = true;
        }
    });

    window_state.restoreDevTools(mainWindow);

    ipc.on("renderer-ready", (event: Event, required_sources: any[]) => {
        console.log("main.ts: Initialize sources: " + required_sources.map(s => s.source));

        // TODO: User should select streams to load
        for (const src of required_sources) {
            const loaded = loader.load(src.source);
            if (loaded !== null) {
                global.sources.push(loaded.raw_source);
            }
        }
    });
});

