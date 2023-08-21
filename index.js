const { app, dialog } = require('electron');
const path = require('path');
const chrome = require('./src/chrome');
const runtime = require('./src/app_runtime');
const openOrchid = require('./src/openorchid');
const protocols = require('electron-protocols');
const isDev = require('electron-is-dev');
const update = require('./src/update');
const electronDl = require('electron-dl');

require('dotenv').config();

electronDl();

app.allowRendererProcessReuse = true;

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
  console.log(`${title}\n${content}`);
};

protocols.register('openorchid', (uri) => {
  if (uri.pathname) {
    return path.join(__dirname, 'internal', uri.host, uri.pathname);
  }
  return path.join(__dirname, 'internal', uri.host);
});

// When the app is ready, create the main window
app.on('ready', function () {
  process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    // Handle the error as needed
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled promise rejection:', reason);
    // Handle the rejection as needed
  });

  update.init();

  runtime();
  if (process.argv.indexOf('--chrome') !== -1) {
    chrome();
  } else {
    openOrchid();
  }
});

// Quit the app when all windows are closed
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

if (isDev) {
  require('electron-reload')(path.resolve(process.env.OPENORCHID_WEBAPPS), {
    hardResetMethod: 'exit'
  });
}
