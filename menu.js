const {
    app,
    Menu,
    shell,
    BrowserWindow,
    dialog,
    globalShortcut
} = require('electron');
const { ipcMain } = require('electron');
const fs = require('fs');

function saveFile() {
    console.log('Saving the file');

    const window = BrowserWindow.getFocusedWindow();
    window.webContents.send('editor-event', 'save');
}

function loadFile() {
    // show open dialog
    console.log('Open the file');
    const window = BrowserWindow.getFocusedWindow();

    const options = {
        title: 'Pick a markdown file',
        filters: [
            { name: 'Markdown files', extensions: ['md'] },
            { name: 'Text files', extensions: ['txt'] }
        ]
    };

    dialog.showOpenDialog(window, options)
        .then(({ filePaths}) => {
            if (filePaths && filePaths.length > 0) {
                const content = fs.readFileSync(filePaths[0]).toString();
                window.webContents.send('load', content);
            }
        });
}

const template = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Open',
                accelerator: 'CommandOrControl+O',
                click() {
                    loadFile();
                }
            },
            {
                label: 'Save',
                accelerator: 'CommandOrControl+S',
                click() {
                    saveFile();
                }
            }
        ]
    },
    {
        label: 'Format',
        submenu: [
            {
                label: 'Toggle Bold',
                click() {
                    const window = BrowserWindow.getFocusedWindow();
                    window.webContents.send(
                        'editor-event',
                        'toggle-bold'
                    );
                }
            },
            {
                label: 'Italic',
                click() {
                    const window = BrowserWindow.getFocusedWindow();
                    window.webContents.send(
                        'editor-event',
                        'italic'
                    );
                }
            },
            {
                label: 'Strikethrough',
                click() {
                    const window = BrowserWindow.getFocusedWindow();
                    window.webContents.send(
                        'editor-event',
                        'strikethrough'
                    );
                }
            }
        ]
    },
    {
        role: 'help',
        submenu: [
            {
                label: 'About Editor Component',
                click() {
                    shell.openExternal('https://simplemde.com/');
                }
            }
        ]
    }
];

if (process.platform === 'darwin') {
    template.unshift({
        label: app.getName(),
        submenu: [
            { role: 'about' },
            { type: 'separator' },
            { role: 'quit' }
        ]
    })
}

if (process.env.DEBUG) {
    template.push({
        label: 'Debugging',
        submenu: [
            {
                label: 'Dev Tools',
                role: 'toggleDevTools'
            },
            { type: 'separator' },
            {
                role: 'reload',
                accelerator: 'Alt+R'
            }
        ]
    });
}

const menu = Menu.buildFromTemplate(template);

app.on('ready', () => {
    globalShortcut.register('CommandOrControl+S', () => {
        saveFile();
    });
    globalShortcut.register('CommandOrControl+O', () => {
        loadFile();
    });
});

ipcMain.on('save', (event, content) => {
    console.log(`Saving content of the file`);

    const window = BrowserWindow.getFocusedWindow();
    const options = {
        title: 'Save markdown file',
        filters: [
            {
                name: 'MyFile',
                extensions: ['md']
            }
        ]
    };
    dialog.showSaveDialog(window, options)
        .then(({ filePath }) => {
            if (filePath) {
                console.log(`Saving content to the file: ${filePath}`);
                fs.writeFileSync(filePath, content);
            }
        });
});

ipcMain.on('editor-reply', (event, arg) => {
    console.log(`Received reply from web page: ${arg}`);
});

module.exports = menu;
