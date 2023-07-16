'use strict';

const { BrowserWindow, ipcMain, Notification } = require('electron');
const path = require('path');

module.exports = function create() {
  const mainWindow = new BrowserWindow({
    icon: path.join(__dirname, '..', 'chrome', 'internal', 'branding', 'icon.png'),
    title: 'Orchid Browser',
    width: 1024,
    height: 640,
    autoHideMenuBar: true,
    frame: false,
    // transparent: true,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInSubFrames: true,
      webviewTag: true,
      contextIsolation: false,
      scrollBounce: true,
      webSecurity: false,
      preload: path.join(__dirname, '..', 'chrome', 'preload.js')
    }
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'chrome', 'index.html'));

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
    // Handle the permission request
    // ...

    // Pass the permission request event with data to the renderer process
    mainWindow.webContents.send('permissionrequest', { event, permissionData });
  });

  // Get the current window instance
  const currentWindow = BrowserWindow.getFocusedWindow();

  // Close window
  ipcMain.on('close-window', () => {
    currentWindow.close();
  });

  // Maximize window
  ipcMain.on('maximize-window', () => {
    if (currentWindow.isMaximized()) {
      currentWindow.restore();
    } else {
      currentWindow.maximize();
    }
  });

  // Minimize window
  ipcMain.on('minimize-window', () => {
    currentWindow.minimize();
  });
}
