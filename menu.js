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

const template = [
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
        console.log('Saving the file');
        const window = BrowserWindow.getFocusedWindow();
        window.webContents.send('editor-event', 'save');
    });
});

ipcMain.on('save', (event, content) => {
    console.log(`Saving content of the file`);
    console.log(content);

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
