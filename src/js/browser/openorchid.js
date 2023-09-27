!(function () {
  'use strict';

  const { BrowserWindow, nativeTheme, Menu, ipcMain } = require('electron');
  const settings = require('../settings');
  const os = require('os');
  const path = require('path');
  const fs = require('fs');
  const isDev = require('electron-is-dev');
  const registerEvents = require('./events');
  const registerControls = require('./controls');
  const update = require('../update/auto_updater');
  const RPC = require('discord-rpc');
  const appConfig = require('../../../package.json');

  require('dotenv').config();
  require('./default_presets');

  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i += 2) {
    const arg = args[i];
    const value = args[i + 1];

    if (arg.startsWith('--')) {
      options[arg.slice(2)] = value;
    } else if (arg.startsWith('-')) {
      options[arg.slice(1)] = value;
    }
  }

  module.exports = function () {
    let systemConfig = {
      width: 320,
      height: 640,
      type: 'Mobile'
    };

    if (options.type) {
      switch (options.type) {
        case 'desktop':
          systemConfig = {
            width: 1024,
            height: 640,
            type: 'Desktop'
          };
          break;

        case 'smart-tv':
          systemConfig = {
            width: 1280,
            height: 720,
            type: 'Smart TV'
          };
          break;

        case 'vr':
          systemConfig = {
            width: 1280,
            height: 720,
            type: 'VR'
          };
          break;

        case 'homepad':
          systemConfig = {
            width: 1280,
            height: 720,
            type: 'Homepad'
          };
          break;

        case 'wear':
          systemConfig = {
            width: 240,
            height: 240,
            type: 'Wear'
          };
          break;

        case 'featurephone':
          systemConfig = {
            width: 240,
            height: 320,
            type: 'Mobile/Featurephone'
          };
          break;

        case 'qwertyphone':
          systemConfig = {
            width: 320,
            height: 240,
            type: 'Mobile/Qwertyphone'
          };
          break;

        default:
          break;
      }
    }

    // Create the browser window.
    const mainWindow = new BrowserWindow({
      icon: path.join(
        __dirname,
        '..',
        '..',
        '..',
        'internal',
        'branding',
        'icon.png'
      ),
      title: 'OpenOrchid Simulator',
      width:
        process.platform !== 'win32' ? systemConfig.width : systemConfig.width + 14,
      height:
        process.platform !== 'win32' ? systemConfig.height : systemConfig.height + 37,
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
        webviewTag: true,
        defaultFontSize: 16,
        defaultMonospaceFontSize: 14,
        defaultFontFamily: 'Jali Arabic',
        disableDialogs: true,
        preload: path.join(__dirname, '..', 'preload.js'),
        devTools: isDev
      }
    });

    const menu = Menu.buildFromTemplate(require('./dropmenu')(mainWindow));
    Menu.setApplicationMenu(menu);

    const userAgent = `Mozilla/5.0 (OpenOrchid ${appConfig.version} ${
      systemConfig.type
    }; Linux ${os.arch()}; ${appConfig.manufacturer} ${
      appConfig.deviceModelName
    }; ${
      appConfig.servicePackName
    }) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${
      process.versions.chrome
    } OrchidBrowser/${appConfig.version}${
      systemConfig.type === 'Mobile' ? ' ' + systemConfig.type : ''
    } Safari/537.36`;

    // and load the index.html of the app.
    mainWindow.loadURL('http://system.localhost:8081/index.html', {
      userAgent
    });

    // Open the DevTools.
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }

    // Initialize updater
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
          details: `Testing ${systemConfig.type} On Simulator`,
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
