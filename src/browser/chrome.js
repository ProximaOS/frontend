!(function () {
  'use strict';

  const { BrowserWindow } = require('electron');
  const path = require('path');
  const fs = require('fs');
  const registerEvents = require('./events');
  const Settings = require('../settings');
  const isDev = require('electron-is-dev');

  require('dotenv').config();
  require('./default_presets');

  module.exports = function () {
    const mainWindow = new BrowserWindow({
      icon: path.join(__dirname, '..', '..', 'internal', 'branding', 'browser', 'browser_64.png'),
      title: 'Orchid Browser',
      width: 1024,
      height: 640,
      autoHideMenuBar: true,
      frame: false,
      webPreferences: {
        nodeIntegration: true,
        nodeIntegrationInSubFrames: true,
        webviewTag: true,
        defaultFontSize: 16,
        defaultMonospaceFontSize: 14,
        defaultFontFamily: '-orchid-internal-font',
        disableDialogs: true,
        preload: path.join(__dirname, '..', '..', 'internal', 'preload.js'),
        enableBlinkFeatures: 'OverlayScrollbar',
        devTools: isDev
      }
    });

    mainWindow.loadFile(path.join(__dirname, '..', '..', 'internal', 'browser', 'index.html'));

    // Load JavaScript and CSS files
    mainWindow.webContents.on('dom-ready', () => {
      const webviewScriptPath = path.join(__dirname, '..', '..', 'internal', 'webview', 'webview.js');
      mainWindow.webContents.executeJavaScript(fs.readFileSync(webviewScriptPath, 'utf8'));

      fs.readdir(path.join(__dirname, '..', '..', 'internal', 'preloads'), (error, files) => {
        if (error) {
          console.error(error);
          return;
        }

        files.forEach((file) => {
          if (file.endsWith('.js')) {
            const scriptPath = path.join(__dirname, '..', '..', 'internal', 'preloads', file);
            mainWindow.webContents.executeJavaScript(fs.readFileSync(scriptPath, 'utf8'));
          }

          if (file.endsWith('.css')) {
            const cssPath = path.join(__dirname, '..', '..', 'internal', 'preloads', file);
            mainWindow.webContents.insertCSS(fs.readFileSync(cssPath, 'utf8'));
          }
        });
      });
    });

    // Open the DevTools.
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }

    // Initialize updater
    update.init(mainWindow);

    // Prepare profile
    fs.mkdirSync(path.join(process.env.ORCHID_APP_PROFILE), {
      recursive: true
    });

    // Get settings
    Settings.getValue('video.dark_mode.enabled').then((result) => {
      nativeTheme.themeSource = result ? 'dark' : 'light';
    });

    // Implement event listeners
    ipcMain.on('change-theme', (event, theme) => {
      nativeTheme.themeSource = theme;
    });

    registerEvents(mainWindow);
  };
})();
