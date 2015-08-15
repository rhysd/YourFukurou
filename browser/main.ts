import * as app from "app";
import * as path from "path";
import * as fs from "fs";
import BrowserWindow = require("browser-window");
import {openExternal} from "shell";

require("crash-reporter").start();

// Show versions {{{
const versions: any = process.versions;
console.log("Stream version 0.0.0");
console.log("  Electron version " + versions.electron);
console.log("  Chrome version " + versions.chrome);
console.log("  io.js version " + versions.node);
// }}}

// Main Window {{{
var mainWindow = null;

app.on("window-all-closed", function(){ app.quit(); });

app.on("ready", function(){
    mainWindow = new BrowserWindow(
        {
            width: 800,
            height: 800,
        }
    );

    mainWindow.loadUrl("https://github.com/rhysd/Stream");

    mainWindow.on("closed", function(){
        mainWindow = null;
    });

    mainWindow.on("will-navigate", function(e: Event, url: string){
        e.preventDefault();
        openExternal(url);
    });
});
// }}}

