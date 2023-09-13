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

    // Create the browser window.
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
      // show: false,
      fullscreenable: false,
      disableAutoHideCursor: true,
      center: true,
      backgroundColor: '#000000',
      tabbingIdentifier: 'openorchid',
      kiosk: true,
      webPreferences: {
        nodeIntegration: true,
        nodeIntegrationInSubFrames: true,
        // contextIsolation: false,
        webviewTag: true,
        defaultFontSize: 16,
        defaultMonospaceFontSize: 14,
        defaultFontFamily: 'Jali Arabic',
        disableDialogs: true,
        preload: path.join(__dirname, '..', 'preload.js'),
        devTools: isDev
      }
    });

    const menu = Menu.buildFromTemplate(require('./menu')(mainWindow));
    Menu.setApplicationMenu(menu);

    const userAgent = `Mozilla/5.0 (OpenOrchid ${
      appConfig.version
    } ${type}; Linux ${os.arch()}; ${appConfig.manufacturer} ${
      appConfig.deviceModelName
    }; ${
      appConfig.servicePackName
    }) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${
      process.versions.chrome
    } OrchidBrowser/${appConfig.version}${
      type === 'Mobile' ? ' ' + type : ''
    } Safari/537.36`;

    // and load the index.html of the app.
    mainWindow.loadURL('http://system.localhost:8081/index.html', {
      userAgent
    });

    // Open the DevTools.
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }

    // update.init(mainWindow);

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

    // Initialize the Discord RPC client
    const client = new RPC.Client({ transport: 'ipc' });
    client.login({
      clientId: '1148745283744841790',
      clientSecret: 'oksnQ1MVAQO-iloXQlUuIVxFzO-bp0wC'
    });

    client.on('ready', () => {
      console.log('Authed for user', client.user.username);
      client.request('SET_ACTIVITY', {
        pid: process.pid,
        activity: {
          details: `Testing ${type} On Simulator`,
          assets: {
            large_image: 'appicon',
            large_text: 'Default'
          },
          buttons: [
            {
              label: 'Try OrchidOS',
              url: 'https://openorchid.github.io/orchidos/'
            },
            {
              label: 'Join Orchid Community',
              url: 'https://discord.gg/TQUKcWEcCz'
            }
          ]
        }
      });
    });
  };
})();
