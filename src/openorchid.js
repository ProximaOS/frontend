'use strict';

const { BrowserWindow, ipcMain, Notification, nativeTheme, app } = require('electron');
const settings = require('electron-settings');
const path = require('path');
const fs = require('fs');

require('dotenv').config();

module.exports = function create() {
  var width = 320;
  var height = 640;
  var url = 'http://system.localhost:8081/index.html';
  if (process.argv.indexOf('--desktop') !== -1) {
    width = 1024;
    height = 640;
    url = 'http://desktop-system.localhost:8081/index.html';
  } else if (process.argv.indexOf('--smart-tv') !== -1) {
    width = 1280;
    height = 720;
    url = 'http://smart-system.localhost:8081/index.html';
  }

  const mainWindow = new BrowserWindow({
    icon: path.join(__dirname, '..', 'internal', 'branding', 'icon.png'),
    title: 'OpenOrchid Simulator',
    width: width,
    height: height,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInSubFrames: true,
      webviewTag: true,
      contextIsolation: false,
      scrollBounce: true,
      webSecurity: false,
      defaultFontFamily: 'system-ui',
      defaultMonospaceFontSize: 14,
      disableDialogs: true,
      devTools: require('electron-is-dev'),
      preload: path.join(__dirname, '..', 'preload.js')
    }
  });

  fs.mkdirSync(path.join(process.cwd(), 'profile'), { recursive: true });

  var profileDir = path.resolve(process.env.OPENORCHID_DATA);

  app.setPath('appData', profileDir);
  app.setPath('sessionData', path.join(profileDir, 'session-data'));
  app.setPath('temp', path.join(profileDir, 'temp'));
  app.setPath('desktop', path.join(profileDir, 'storage', 'others', 'desktop'));
  app.setPath('documents', path.join(profileDir, 'storage', 'others', 'documents'));
  app.setPath('downloads', path.join(profileDir, 'storage', 'downloads'));
  app.setPath('music', path.join(profileDir, 'storage', 'music'));
  app.setPath('pictures', path.join(profileDir, 'storage', 'photos'));
  app.setPath('videos', path.join(profileDir, 'storage', 'movies'));
  app.setPath('logs', path.join(profileDir, 'logs'));
  app.setPath('cache', path.join(profileDir, 'cache'));
  app.setPath('crashDumps', path.join(profileDir, 'crash-dumps'));

  mainWindow.loadURL(url, {
    userAgent: 'Mozilla/5.0 (Linux; OpenOrchid 1.0.0; rv:114.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0 Mobile Safari/537.36 OpenOrchid/1.0.0'
  });

  if (!settings.getSync('system.theme.color-scheme')) {
    settings.setSync('system.theme.color-scheme', 'light');
  }
  nativeTheme.themeSource = settings.getSync('system.theme.color-scheme');

  // Notification event
  ipcMain.on('trigger-notification', (event, notificationData) => {
    const { title, body } = notificationData;
    const notification = new Notification({
      title: title,
      body: body
    });

    notification.show();

    // Pass the notification event with data to the renderer process
    mainWindow.webContents.send('notification', { event, notificationData });
  });

  // Open event
  ipcMain.on('open-url', (event, url) => {
    // Pass the open event with URL to the renderer process
    mainWindow.webContents.send('open-url', { event, url });
  });

  // Permission request event
  ipcMain.on('request-permissions', (event, permissionData) => {
    // Pass the permission request event with data to the renderer process
    mainWindow.webContents.send('permissionrequest', { event, permissionData });
  });

  ipcMain.on('message', (event, data) => {
    mainWindow.webContents.send('message', data);
    ipcMain.on('message-reply', (event, data) => {
      event.reply('message-reply', { data, isAllowed: true });
    });
  });

  ipcMain.on('settings-getvalue', (event, key) => {
    const value = settings.get(key.name);
    event.reply('settings-getvalue-reply', value);
  });

  ipcMain.on('settings-setvalue', (event, key) => {
    settings.set(key.name, key.value);
  });
}
