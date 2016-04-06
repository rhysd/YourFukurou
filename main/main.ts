import {join} from 'path';
import {app, BrowserWindow} from 'electron';

app.once('window-all-closed', () => app.quit());

app.once('ready', () => {
    const index_html = 'file://' + join(__dirname, '..', 'index.html');
    let win = new BrowserWindow({
        width: 800,
        height: 600,
    });

    win.once('closed', () => { win = null; });

    win.loadURL(index_html);
});


