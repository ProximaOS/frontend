const { app, dialog, ipcMain } = require('electron');
const path = require('path');
const loadChrome = require('./browser/chrome');
const initiateServer = require('./server');
const loadOpenOrchid = require('./browser/openorchid');
const protocols = require('electron-protocols');
const isDev = require('electron-is-dev');
const electronReload = require('electron-reload');
const { program } = require('commander');

require('dotenv').config();

program
  .option(
    '-t, --type <value>',
    'Specifies which type of OpenOrchid platform to use'
  )
  .parse(process.argv);

  const options = program.opts();

const profileDir = path.resolve(process.env.OPENORCHID_DATA);
app.setPath('appData', profileDir);
app.setPath('userData', profileDir);
app.setPath('sessionData', path.join(profileDir));
app.setPath('temp', path.join(profileDir, 'temp'));
app.setPath('desktop', path.join(profileDir, 'storage', 'others', 'desktop'));
app.setPath('documents', path.join(profileDir, 'storage', 'documents'));
app.setPath('downloads', path.join(profileDir, 'storage', 'downloads'));
app.setPath('music', path.join(profileDir, 'storage', 'music'));
app.setPath('pictures', path.join(profileDir, 'storage', 'photos'));
app.setPath('videos', path.join(profileDir, 'storage', 'movies'));
app.setPath('logs', path.join(profileDir, 'logs'));
app.setPath('cache', path.join(profileDir, 'cache'));
app.setPath('crashDumps', path.join(profileDir, 'crash-dumps'));

// Disable error dialogs by overriding
dialog.showErrorBox = function (title, content) {
  console.error(`${title}\n${content}`);
};
dialog.showMessageBox = function (options, callback) {
  // Trigger your IPC event instead of displaying the native dialog
  ipcMain.emit('messagebox', options);

  // You can also handle the callback if needed
  if (callback) {
    ipcMain.on('messagebox-reply', (event, data) => {
      callback(data.code);
    });
  }
};
dialog.showOpenDialog = (options, callback) => {
  // Trigger your IPC event instead of displaying the native dialog
  ipcMain.emit('openfile', options);

  // You can also handle the callback if needed
  if (callback) {
    ipcMain.on('openfile-reply', (event, data) => {
      callback(data.files);
    });
  }
};
dialog.showSaveDialog = (options, callback) => {
  // Trigger your IPC event instead of displaying the native dialog
  ipcMain.emit('savefile', options);

  // You can also handle the callback if needed
  if (callback) {
    ipcMain.on('savefile-reply', (event, data) => {
      callback(data.filepath);
    });
  }
};

protocols.register('openorchid', (uri) => {
  if (uri.pathname) {
    return path.join(__dirname, 'internal', uri.host, uri.pathname);
  }
  return path.join(__dirname, 'internal', uri.host);
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function () {
  process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    // Handle the error as needed
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled promise rejection:', reason);
    // Handle the rejection as needed
  });

  initiateServer(app);
  if (process.argv.indexOf('--chrome') !== -1) {
    loadChrome();
  } else {
    loadOpenOrchid();
  }
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

if (isDev) {
  electronReload(path.join(__dirname, 'src'), {
    hardResetMethod: 'exit'
  });
  electronReload(path.join(__dirname, 'internal'), {
    hardResetMethod: 'exit'
  });
  electronReload(path.resolve(process.env.OPENORCHID_WEBAPPS), {
    hardResetMethod: 'exit'
  });
}
