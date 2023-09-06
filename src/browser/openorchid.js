!(function () {
  'use strict';

  const { BrowserWindow, nativeTheme, Menu, ipcMain } = require('electron');
  const settings = require('../openorchid-settings');
  const os = require('os');
  const path = require('path');
  const fs = require('fs');
  const isDev = require('electron-is-dev');
  const registerEvents = require('../events/main_events');
  const registerControls = require('../developer/controls');
  const update = require('../update/auto_updater');
  const RPC = require('discord-rpc');

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
      icon: path.join(
        __dirname,
        '..',
        '..',
        'internal',
        'branding',
        'icon.png'
      ),
      title: 'OpenOrchid Simulator',
      width: process.platform !== 'win32' ? width : width + 14,
      height: process.platform !== 'win32' ? height : height + 37,
      show: false,
      fullscreenable: false,
      autoHideMenuBar: true,
      center: true,
      disableAutoHideCursor: true,
      backgroundColor: '#000000',
      backgroundMaterial: 'mica',
      tabbingIdentifier: 'openorchid',
      kiosk: true,
      webPreferences: {
        nodeIntegration: true,
        nodeIntegrationInSubFrames: true,
        contextIsolation: false,
        webviewTag: true,
        defaultFontSize: 16,
        defaultMonospaceFontSize: 14,
        defaultFontFamily: 'Jali Arabic',
        additionalArguments: true,
        experimentalFeatures: true,
        disableDialogs: true,
        preload: path.join(__dirname, '..', 'preload.js'),
        devTools: isDev
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

    mainWindow.on('focus', (event, data) => {
      // Initialize the Discord RPC client
      const client = new RPC.Client({ transport: 'ipc' });
      client.login({
        clientId: '1148745283744841790',
        clientSecret: 'oksnQ1MVAQO-iloXQlUuIVxFzO-bp0wC'
      });

      client.on('ready', () => {
        console.log('Logged in as', client.application.name);
        console.log('Authed for user', client.user.username);
      });

      // Update presence when your app is active
      client.setActivity({
        details: `Running edition is ${type}`,
        state: isDev ? 'Is in development' : 'Casual Usage',
        largeImageKey: 'large-image-key', // Replace with your large image key
        smallImageKey: 'small-image-key', // Replace with your small image key
        startTimestamp: new Date()
      });
    });
  };
})();
