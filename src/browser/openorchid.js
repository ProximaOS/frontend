const { l18n, initializeLocale } = require('../locales/locale_reader');
const Settings = require('../settings');

!(function () {
  'use strict';

  const {
    BrowserWindow,
    nativeTheme,
    Menu,
    ipcMain,
    BrowserView
  } = require('electron');
  const settings = require('../settings');
  const os = require('os');
  const path = require('path');
  const fs = require('fs');
  const isDev = require('electron-is-dev');
  const registerEvents = require('./events');
  const registerControls = require('./controls');
  const update = require('../update/auto_updater');
  const RPC = require('discord-rpc');
  const appConfig = require('../../package.json');

  require('dotenv').config();
  require('dotenv').config({ path: '.env.secret' });
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

  initializeLocale();

  module.exports = async function () {
    let systemConfig;
    let defaultEdition = await Settings.getValue(
      'system.edition',
      'internal.json'
    );

    if (options.type) {
      defaultEdition = options.type;
    }

    switch (defaultEdition) {
      case 'mobile':
        systemConfig = {
          id: 'mobile',
          width: 1024,
          height: 640,
          type: 'Mobile'
        };
        break;

      case 'desktop':
        systemConfig = {
          id: 'desktop',
          width: 1024,
          height: 640,
          type: 'Desktop'
        };
        break;

      case 'smart_tv':
        systemConfig = {
          id: 'smart_tv',
          width: 1280,
          height: 720,
          type: 'Smart TV'
        };
        break;

      case 'vr':
        systemConfig = {
          id: 'vr',
          width: 1280,
          height: 720,
          type: 'VR'
        };
        break;

      case 'homepad':
        systemConfig = {
          id: 'home',
          width: 1280,
          height: 720,
          type: 'Homepad'
        };
        break;

      case 'wear':
        systemConfig = {
          id: 'watch',
          width: 240,
          height: 240,
          type: 'Wear'
        };
        break;

      case 'featurephone':
        systemConfig = {
          id: 'featurephone',
          width: 240,
          height: 320,
          type: 'Mobile/Featurephone'
        };
        break;

      default:
        break;
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
      title: `OrchidOS ${appConfig.version} ${systemConfig.type} - Orchid Simulator`,
      width:
        process.platform !== 'win32'
          ? systemConfig.width + 50
          : systemConfig.width + 50 + 14,
      height:
        process.platform !== 'win32'
          ? systemConfig.height
          : systemConfig.height + 37,
      // show: false,
      // fullscreenable: false,
      disableAutoHideCursor: true,
      autoHideMenuBar: true,
      center: true,
      backgroundColor: '#000000',
      tabbingIdentifier: 'openorchid',
      // kiosk: true
    });

    const menu = Menu.buildFromTemplate(require('./dropmenu')(mainWindow));
    Menu.setApplicationMenu(menu);

    // Browser view renderer
    const webview = new BrowserView({
      webPreferences: {
        nodeIntegration: true,
        nodeIntegrationInSubFrames: true,
        webviewTag: true,
        defaultFontSize: 16,
        defaultMonospaceFontSize: 14,
        defaultFontFamily: 'Jali Arabic',
        disableDialogs: true,
        preload: path.join(__dirname, '..', '..', 'internal', 'preload.js'),
        enableBlinkFeatures: 'OverlayScrollbar',
        devTools: isDev
      }
    });
    const { width, height } = mainWindow.getContentBounds();
    webview.setBounds({ x: 0, y: 0, width: width - 50, height });
    webview.setAutoResize({
      width: true,
      height: true
    });
    mainWindow.addBrowserView(webview);

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
    webview.webContents.loadURL(
      await Settings.getValue('system.main.url', 'internal.json'),
      {
        userAgent
      }
    );

    // Load JavaScript and CSS files
    webview.webContents.on('dom-ready', () => {
      const webviewScriptPath = path.join(
        __dirname,
        '..',
        '..',
        'internal',
        'webview',
        'webview.js'
      );
      webview.webContents.executeJavaScript(
        fs.readFileSync(webviewScriptPath, 'utf8')
      );

      fs.readdir(
        path.join(__dirname, '..', '..', 'internal', 'preloads'),
        (error, files) => {
          if (error) {
            console.error(error);
            return;
          }

          files.forEach((file) => {
            if (file.endsWith('.js')) {
              const scriptPath = path.join(
                __dirname,
                '..',
                '..',
                'internal',
                'preloads',
                file
              );
              webview.webContents.executeJavaScript(
                fs.readFileSync(scriptPath, 'utf8')
              );
            }

            if (file.endsWith('.css')) {
              const cssPath = path.join(
                __dirname,
                '..',
                '..',
                'internal',
                'preloads',
                file
              );
              webview.webContents.insertCSS(fs.readFileSync(cssPath, 'utf8'));
            }
          });
        }
      );
    });

    // Open the DevTools.
    if (isDev) {
      webview.webContents.openDevTools();
    }

    // Initialize updater
    // update.init(mainWindow);

    // Prepare profile
    fs.mkdirSync(path.join(process.env.ORCHID_APP_PROFILE), {
      recursive: true
    });

    // Get settings
    settings.getValue('video.dark_mode.enabled').then((result) => {
      nativeTheme.themeSource = result ? 'dark' : 'light';
    });

    // Implement event listeners
    ipcMain.on('change-theme', (event, theme) => {
      nativeTheme.themeSource = theme;
    });

    mainWindow.on('blur', async () => {
      setActivity(await l18n('idle-inactive'));
    });
    mainWindow.on('hide', async () => {
      setActivity(await l18n('idle-hidden'));
    });
    mainWindow.on('minimize', async () => {
      setActivity(await l18n('idle-minimized'));
    });
    mainWindow.on('show', async () => {
      setActivity(
        isDev ? await l18n('activeState-dev') : await l18n('activeState-prod')
      );
    });
    mainWindow.on('focus', async () => {
      setActivity(
        isDev ? await l18n('activeState-dev') : await l18n('activeState-prod')
      );
    });
    mainWindow.on('restore', async () => {
      setActivity(
        isDev ? await l18n('activeState-dev') : await l18n('activeState-prod')
      );
    });
    mainWindow.on('unresponsive', async () => {
      setActivity(await l18n('activeState-hang'));
    });
    mainWindow.on('responsive', async () => {
      setActivity(
        isDev ? await l18n('activeState-dev') : await l18n('activeState-prod')
      );
    });

    registerEvents(mainWindow, webview);
    if (isDev) {
      registerControls(mainWindow, webview);
    }

    // Initialize the Discord RPC client
    const client = new RPC.Client({ transport: 'ipc' });
    client.login({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.API_KEY_DISCORD
    });

    const activityTimestamp = Date.now();
    async function setActivity(message) {
      client.request('SET_ACTIVITY', {
        pid: process.pid,
        activity: {
          details: await l18n('discordDetail', {
            edition: await l18n(`deviceType-${systemConfig.id}-short`)
          }),
          state: message,
          timestamps: {
            start: activityTimestamp
          },
          assets: {
            large_image: 'appicon',
            large_text: 'OrchidOS',
            small_image: `platform_${systemConfig.id}`,
            small_text: await l18n(`deviceType-${systemConfig.id}`)
          },
          buttons: [
            {
              label: await l18n('discordRpc-try'),
              url: 'https://github.com/openorchid/openorchid'
            },
            {
              label: await l18n('discordRpc-join'),
              url: 'https://discord.gg/TQUKcWEcCz'
            }
          ],
          instance: true
        }
      });
    }

    client.on('ready', () => {
      console.log('Authed for user', client.user.username);
      setActivity(isDev ? l18n('activeState-dev') : l18n('activeState-prod'));
    });

    client.on('disconnected', () => {
      console.warn('Disconnected from Discord');
    });
  };
})();
