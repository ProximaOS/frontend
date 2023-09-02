!(function () {
  'use strict';

  const {
    BrowserWindow,
    nativeTheme,
    Menu,
    ipcMain
  } = require('electron');
  const settings = require('../openorchid-settings');
  const os = require('os');
  const path = require('path');
  const fs = require('fs');
  const isDev = require('electron-is-dev');
  const registerEvents = require('../events/main_events');
  const registerControls = require('../developer/controls');
  const update = require('../update/auto_updater');

  const appConfig = require('../../package.json');

  require('dotenv').config();

  require('../default_presets');

  module.exports = function () {
    let width = 320;
    let height = 640;
    let type = 'Mobile';
    if (process.argv.indexOf('--desktop') !== -1) {
      width = 1024;
      height = 640;
      type = 'Desktop';
    } else if (process.argv.indexOf('--smart-tv') !== -1) {
      width = 1280;
      height = 720;
      type = 'Smart TV';
    }

    const mainWindow = new BrowserWindow({
      icon: path.join(__dirname, '..', '..', 'internal', 'branding', 'icon.png'),
      title: 'OpenOrchid Simulator',
      width: process.platform !== 'win32' ? width : width + 14,
      height: process.platform !== 'win32' ? height : height + 37,
      fullscreenable: false,
      show: false,
      webPreferences: {
        nodeIntegration: true,
        nodeIntegrationInSubFrames: true,
        contextIsolation: false,
        webviewTag: true,
        webSecurity: false,
        defaultFontFamily: 'Jali Arabic',
        defaultMonospaceFontSize: 14,
        disableDialogs: true,
        devTools: isDev,
        preload: path.join(__dirname, '..', 'preload.js')
      }
    });
    Menu.setApplicationMenu(null);

    update.init(mainWindow);

    const userAgent = `Mozilla/5.0 (OpenOrchid ${
      appConfig.version
    }; ${type}; Linux ${os.arch()}) Chrome/${process.versions.chrome}${
      type === 'Mobile' ? ' ' + type : false
    } Safari/537.36`;

    mainWindow.loadURL('http://system.localhost:8081/index.html', {
      userAgent
    });

    fs.mkdirSync(path.join(process.env.OPENORCHID_DATA), { recursive: true });

    settings.getValue('video.dark_mode.enabled').then((result) => {
      nativeTheme.themeSource = result ? 'dark' : 'light';
    });

    ipcMain.on('change-theme', (event, theme) => {
      nativeTheme.themeSource = theme;
    });

    registerEvents(mainWindow);
    if (isDev) {
      registerControls(mainWindow);
    }
  };
})();
