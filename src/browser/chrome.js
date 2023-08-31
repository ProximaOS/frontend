!(function () {
  'use strict';

  const { BrowserWindow } = require('electron');
  const path = require('path');
  const registerEvents = require('../events/main_events');
  const registerControls = require('../developer/controls');

  module.exports = function () {
    const mainWindow = new BrowserWindow({
      icon: path.join(
        __dirname,
        '..', '..',
        'internal',
        'branding',
        'browser',
        'browser_64.png'
      ),
      title: 'Orchid Browser',
      width: 1024,
      height: 640,
      autoHideMenuBar: true,
      frame: false,
      webPreferences: {
        nodeIntegration: true,
        nodeIntegrationInSubFrames: true,
        webviewTag: true,
        contextIsolation: false,
        scrollBounce: true,
        webSecurity: false,
        preload: path.join(__dirname, 'preload.js')
      }
    });

    mainWindow.loadFile(path.join(__dirname, '..', 'chrome', 'index.html'));

    fs.mkdirSync(path.join(process.env.OPENORCHID_DATA), { recursive: true });

    settings.getValue('video.dark_mode.enabled').then((result) => {
      nativeTheme.themeSource = result ? 'dark' : 'light';
    });

    registerEvents(mainWindow);
    if (isDev) {
      registerControls(mainWindow);
    }
  };
})();
