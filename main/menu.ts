import {join} from 'path';
import {Menu, shell, app} from 'electron';
import openAboutWindow from 'about-window';

export function createMenuTemplate() {
    let help_submenu = [
        {
            label: 'About YourFukurou',
            click: () => openAboutWindow({
                icon_path: join(__dirname, '..', 'images', 'icon.png'),
                copyright: 'Copyright (c) 2015 rhysd',
            }),
        },
        // TODO:
        // Should add a usage documentation and a menu item to it.
        {
            label: 'See Code on GitHub',
            click: () => shell.openExternal('https://github.com/rhysd/YourFukurou'),
        },
    ] as Electron.MenuItemOptions[];

    let template = [
        {
            label: 'Edit',
            submenu: [
                {
                    label: 'Undo',
                    accelerator: 'CmdOrCtrl+Z',
                    role: 'undo',
                },
                {
                    label: 'Redo',
                    accelerator: 'Shift+CmdOrCtrl+Z',
                    role: 'redo',
                },
                {
                    type: 'separator',
                },
                {
                    label: 'Cut',
                    accelerator: 'CmdOrCtrl+X',
                    role: 'cut',
                },
                {
                    label: 'Copy',
                    accelerator: 'CmdOrCtrl+C',
                    role: 'copy',
                },
                {
                    label: 'Paste',
                    accelerator: 'CmdOrCtrl+V',
                    role: 'paste',
                },
                {
                    label: 'Select All',
                    accelerator: 'CmdOrCtrl+A',
                    role: 'selectall',
                },
            ],
        },
        {
            label: 'View',
            submenu: [
                {
                    label: 'Reload',
                    accelerator: 'CmdOrCtrl+R',
                    click: (_: any, w: Electron.BrowserWindow) => {
                        if (w) { w.reload(); }
                    },
                },
                {
                    label: 'Toggle Full Screen',
                    accelerator: process.platform === 'darwin' ? 'Ctrl+Command+F' : 'F11',
                    click: (_: any, w: Electron.BrowserWindow) => {
                        if (w) { w.setFullScreen(!w.isFullScreen()); }
                    },
                },
                {
                    label: 'Open Developer Tools',
                    accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
                    click: (_: any, w: Electron.BrowserWindow) => {
                        if (w) { w.webContents.openDevTools({mode: 'detach'}); }
                    },
                },
            ],
        },
        {
            label: 'Window',
            role: 'window',
            submenu: [
                {
                    label: 'Minimize',
                    accelerator: 'CmdOrCtrl+M',
                    role: 'minimize',
                },
                {
                    label: 'Close',
                    accelerator: 'CmdOrCtrl+W',
                    role: 'close',
                },
            ],
        },
        {
            label: 'Help',
            role: 'help',
            submenu: help_submenu,
        },
    ] as Electron.MenuItemOptions[];

    if (process.platform === 'darwin') {
        template.unshift({
            label: 'YourFukurou',
            submenu: [
                {
                    label: 'About YourFukurou',
                    click: () => openAboutWindow({
                        icon_path: join(__dirname, '..', 'images', 'icon.png'),
                        copyright: 'Copyright (c) 2015 rhysd',
                    }),
                },
                {
                    type: 'separator',
                },
                {
                    label: 'Services',
                    role: 'services',
                    submenu: [],
                },
                {
                    type: 'separator',
                },
                {
                    label: 'Hide YourFukurou',
                    accelerator: 'Command+H',
                    role: 'hide',
                },
                {
                    label: 'Hide Others',
                    accelerator: 'Command+Alt+H',
                    role: 'hideothers',
                },
                {
                    label: 'Show All',
                    role: 'unhide',
                },
                {
                    type: 'separator',
                },
                {
                    label: 'Quit',
                    accelerator: 'Command+Q',
                    click: () => app.quit(),
                },
            ],
        });
        help_submenu.push(
            {
                type: 'separator',
            },
            {
                label: 'Bring All to Front',
                role: 'front',
            },
        );
    }
    return Menu.buildFromTemplate(template);
}

export default function setApplicationMenu() {
    Menu.setApplicationMenu(createMenuTemplate());
}
