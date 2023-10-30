!(function () {
  'use strict';

  const { BrowserWindow } = require('electron');
  const path = require('path');
  const registerEvents = require('./events');
  const Settings = require('../settings');

  require('dotenv').config();
  require('./default_presets');

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
        defaultFontSize: 16,
        defaultMonospaceFontSize: 14,
        defaultFontFamily: 'Jali Arabic',
        disableDialogs: true,
        preload: path.join(__dirname, '..', '..', 'internal', 'preload.js'),
        enableBlinkFeatures: 'OverlayScrollbar'
      }
    });

    mainWindow.loadFile(path.join(__dirname, '..', '..', 'internal', 'browser', 'index.html'));

    fs.mkdirSync(path.join(process.env.ORCHID_APP_PROFILE), { recursive: true });

    Settings.getValue('video.dark_mode.enabled').then((result) => {
      nativeTheme.themeSource = result ? 'dark' : 'light';
    });

    registerEvents(mainWindow);
  };
})();
