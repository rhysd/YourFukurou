import * as app from "app";
import BrowserWindow = require("browser-window");
import * as path from "path";
import {openExternal} from "shell";
import SourceLoader from "./source-loader";
import Source from "./source";

require("crash-reporter").start();

// Show versions {{{
const versions: any = process.versions;
console.log("Stream version 0.0.0");
console.log("  Electron version " + versions.electron);
console.log("  Chrome version " + versions.chrome);
console.log("  io.js version " + versions.node);
// }}}

var mainWindow: GitHubElectron.BrowserWindow = null;
var sources: Source[] = [];
global.load_paths = [
    path.join(app.getAppPath(), "plugin"),
    path.join(app.getPath("userData"), "plugin", "node_modules")
];

app.on("window-all-closed", function(){ app.quit(); });

app.on("ready", function(){
    mainWindow = new BrowserWindow(
        {
            width: 800,
            height: 800,
        }
    );

    const loader = new SourceLoader(global.load_paths, mainWindow);

    const html = "file://" + path.resolve(__dirname, "..", "..", "index.html");
    mainWindow.loadUrl(html);

    mainWindow.on("closed", function(){
        mainWindow = null;
    });

    mainWindow.on("will-navigate", function(e: Event, url: string){
        e.preventDefault();
        openExternal(url);
    });

    // TODO: User should select streams to load
    sources.push(loader.load("dummy"));

    mainWindow.openDevTools();
});

