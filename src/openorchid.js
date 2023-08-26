!(function () {
  'use strict';

  const {
    BrowserWindow,
    ipcMain,
    nativeTheme,
    Menu,
    app
  } = require('electron');
  const settings = require('./services/settings');
  const os = require('os');
  const path = require('path');
  const fs = require('fs');
  const isDev = require('electron-is-dev');
  const electronLocalshortcut = require('electron-localshortcut');

  const appConf = require('../package.json');

  require('dotenv').config();

  require('./default_presets');

  module.exports = function () {
    let width = 320;
    let height = 640;
    let url = 'http://system.localhost:8081/index.html';
    let type = 'Mobile';
    if (process.argv.indexOf('desktop') !== -1) {
      width = 1024;
      height = 640;
      url = 'http://desktop-system.localhost:8081/index.html';
      type = 'Desktop';
    } else if (process.argv.indexOf('smart-tv') !== -1) {
      width = 1280;
      height = 720;
      url = 'http://smart-system.localhost:8081/index.html';
      type = 'Smart TV';
    }

    let isSimulatingMobile = false;
    if (process.argv.indexOf('mobile-frame') !== -1) {
      isSimulatingMobile = true;
    }

    const mainWindow = new BrowserWindow({
      icon: path.join(__dirname, '..', 'internal', 'branding', 'icon.png'),
      title: 'OpenOrchid Simulator',
      width: isSimulatingMobile ? width : width + 14,
      height: isSimulatingMobile ? height : height + 37,
      frame: !isSimulatingMobile,
      fullscreenable: false,
      resizable: !isSimulatingMobile,
      webPreferences: {
        nodeIntegration: true,
        nodeIntegrationInSubFrames: true,
        webviewTag: true,
        contextIsolation: false,
        scrollBounce: true,
        webSecurity: false,
        defaultFontFamily: 'Jali Arabic',
        defaultMonospaceFontSize: 14,
        disableDialogs: true,
        devTools: isDev,
        preload: path.join(__dirname, 'preload.js')
      }
    });

    if (isDev) {
      mainWindow.webContents.openDevTools({ mode: 'detach' });
    }

    // Intercept download requests using the webContents' session
    mainWindow.webContents.session.on(
      'will-download',
      (event, item, webContents) => {
        // Send an event to the renderer process to get download path and decision
        mainWindow.webContents.send('downloadrequest', {
          url: item.getURL(),
          suggestedFilename: item.getFilename(),
          lastModified: item.getLastModifiedTime(),
          size: item.getTotalBytes(),
          mime: item.getMimeType()
        });

        // Listen for the response from the renderer process
        ipcMain.once('downloadresponse', (event, downloadData) => {
          if (downloadData.shouldDownload) {
            // Set the download path and start the download
            item.setSavePath(downloadData.path);
          } else {
            // Cancel the download
            item.cancel();
          }
        });

        // Listen for download progress events
        item.on('updated', (event, state) => {
          if (state === 'progressing') {
            // Get download progress
            const progress = item.getReceivedBytes() / item.getTotalBytes();
            mainWindow.webContents.send('download-progress', progress);
          }
        });
      }
    );

    mainWindow.webContents.session.setPermissionRequestHandler(
      (webContents, permission, callback) => {
        mainWindow.webContents.send('permissionrequest', { type: permission });
        ipcMain.on('permissionrequest', (event, data) => {
          callback(data.decision);
        });
      }
    );

    Menu.setApplicationMenu(null);
    electronLocalshortcut.register(mainWindow, ['Ctrl+R', 'F5'], () => {
      mainWindow.reload();
    });
    electronLocalshortcut.register(mainWindow, ['Ctrl+F', 'F11'], () => {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
    });
    electronLocalshortcut.register(mainWindow, ['Ctrl+I', 'F12'], () => {
      mainWindow.openDevTools();
    });

    electronLocalshortcut.register(mainWindow, 'Ctrl+J', () => {
      mainWindow.webContents.send('rotate', { rotation: '-90deg' });
    });
    electronLocalshortcut.register(mainWindow, 'Ctrl+K', () => {
      mainWindow.webContents.send('rotate', { rotation: '0deg' });
    });
    electronLocalshortcut.register(mainWindow, 'Ctrl+L', () => {
      mainWindow.webContents.send('rotate', { rotation: '90deg' });
    });
    electronLocalshortcut.register(mainWindow, 'Ctrl+H', () => {
      mainWindow.webContents.send('rotate', { rotation: '180deg' });
    });

    fs.mkdirSync(path.join(process.env.OPENORCHID_DATA, 'extensions'), { recursive: true });
    fs.readdirSync(process.env.OPENORCHID_ADDONS).forEach(extensionName => {
      const extensionPath = path.join(process.env.OPENORCHID_ADDONS, extensionName);
      mainWindow.webContents.session.loadExtension(extensionPath);
    });

    if (isDev) {
      const controlsWindow = new BrowserWindow({
        icon: path.join(__dirname, '..', 'internal', 'branding', 'icon.png'),
        title: 'OpenOrchid Simulator Controls',
        width: 70,
        minWidth: 70,
        maxWidth: 70,
        height: mainWindow.getSize()[1],
        frame: false,
        fullscreenable: false,
        transparent: true,
        skipTaskbar: true,
        focusable: false,
        resizable: false,
        webPreferences: {
          nodeIntegration: true,
          nodeIntegrationInSubFrames: true,
          contextIsolation: false,
          defaultFontFamily: 'system-ui',
          defaultMonospaceFontSize: 14,
          disableDialogs: true,
          devTools: isDev,
          preload: path.join(__dirname, 'preload.js')
        }
      });

      controlsWindow.loadFile(
        path.join(__dirname, '..', 'internal', 'simulator', 'controls.html')
      );

      let frameWindow = null;
      if (isSimulatingMobile) {
        frameWindow = new BrowserWindow({
          icon: path.join(__dirname, '..', 'internal', 'branding', 'icon.png'),
          title: 'OpenOrchid Simulator Frame',
          width: 426,
          height: 745,
          frame: false,
          fullscreenable: false,
          transparent: true,
          skipTaskbar: true,
          focusable: false,
          resizable: false
        });

        frameWindow.loadFile(
          path.join(__dirname, '..', 'internal', 'simulator', 'frame.html')
        );
        frameWindow.setIgnoreMouseEvents(true);
      }

      let currentSize = mainWindow.getSize();
      let newPosition = mainWindow.getPosition();

      controlsWindow.setPosition(
        currentSize[0] + newPosition[0] + (isSimulatingMobile ? 32 : 0),
        newPosition[1],
        false
      );

      // Calculate the center position for the frameWindow
      const centerX = parseInt(newPosition[0] - (426 - width) / 2);
      const centerY = parseInt(newPosition[1] - (745 - height) / 2 + 24);

      if (frameWindow) {
        // Set the position of the frameWindow at the calculated center
        frameWindow.setPosition(centerX, centerY, false);
      }

      mainWindow.on('moved', () => {
        currentSize = mainWindow.getSize();
        newPosition = mainWindow.getPosition();
        controlsWindow.setPosition(
          currentSize[0] + newPosition[0] + (isSimulatingMobile ? 32 : 0),
          newPosition[1],
          false
        );
        if (frameWindow) {
          // Set the position of the frameWindow at the calculated center
          frameWindow.setPosition(centerX, centerY, false);
        }
      });

      let newSize = mainWindow.getSize();
      controlsWindow.setSize(70, newSize[1], false);
      mainWindow.on('resized', () => {
        newSize = mainWindow.getSize();
        newPosition = mainWindow.getPosition();
        controlsWindow.setSize(70, newSize[1], false);
        controlsWindow.setPosition(
          newSize[0] + newPosition[0],
          newPosition[1],
          false
        );
      });

      mainWindow.on('focus', () => {
        if (controlsWindow) {
          controlsWindow.show();
          controlsWindow.setAlwaysOnTop(true);
        }

        if (frameWindow) {
          frameWindow.show();
          frameWindow.setAlwaysOnTop(true);
        }
      });

      mainWindow.on('blur', () => {
        if (controlsWindow) {
          controlsWindow.hide();
          controlsWindow.setAlwaysOnTop(false);
        }

        if (frameWindow) {
          frameWindow.hide();
          frameWindow.setAlwaysOnTop(false);
        }
      });

      mainWindow.on('restore', () => {
        if (controlsWindow) {
          controlsWindow.show();
          controlsWindow.setAlwaysOnTop(true);
        }

        if (frameWindow) {
          frameWindow.show();
          frameWindow.setAlwaysOnTop(true);
        }
      });

      mainWindow.on('minimize', () => {
        if (controlsWindow) {
          controlsWindow.hide();
          controlsWindow.setAlwaysOnTop(false);
        }

        if (frameWindow) {
          frameWindow.hide();
          frameWindow.setAlwaysOnTop(false);
        }
      });

      mainWindow.on('closed', () => {
        if (controlsWindow) {
          controlsWindow.close();
        }

        if (frameWindow) {
          frameWindow.close();
        }
      });

      electronLocalshortcut.register(controlsWindow, ['Ctrl+R', 'F5'], () => {
        controlsWindow.reload();
      });
      electronLocalshortcut.register(controlsWindow, ['Ctrl+I', 'F12'], () => {
        controlsWindow.openDevTools();
      });
    }

    fs.mkdirSync(path.join(process.env.OPENORCHID_DATA), { recursive: true });

    const userAgent = `Mozilla/5.0 (OpenOrchid ${
      appConf.version
    } ${type}; Linux ${os.arch()}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${
      process.versions.chrome
    }${type === 'Mobile' ? ' ' + type : false} Safari/537.36`;

    console.log(userAgent);
    mainWindow.loadURL(url, {
      userAgent
    });

    settings.getValue('video.dark_mode.enabled').then((result) => {
      nativeTheme.themeSource = result ? 'dark' : 'light';
    });

    // Open event
    app.on('open-url', (event, url) => {
      // Pass the open event with URL to the renderer process
      mainWindow.webContents.send('open-url', { event, url });
    });

    ipcMain.on('message', (event, data) => {
      mainWindow.webContents.send('message', data);
      ipcMain.on('message-reply', (event, data) => {
        mainWindow.webContents.send('message-reply', { data, isAllowed: true });
      });
    });

    ipcMain.on('request-extension-list', (event, data) => {
      mainWindow.webContents.send('extension-list', mainWindow.webContents.session.getAllExtensions());
    });

    ipcMain.on('powerstart', (event, data) => {
      mainWindow.webContents.send('powerstart', data);
    });
    ipcMain.on('powerend', (event, data) => {
      mainWindow.webContents.send('powerend', data);
    });

    ipcMain.on('volumeup', (event, data) => {
      mainWindow.webContents.send('volumeup', data);
    });
    ipcMain.on('volumedown', (event, data) => {
      mainWindow.webContents.send('volumedown', data);
    });

    ipcMain.on('shortcut', (event, data) => {
      mainWindow.webContents.send('shortcut', data);
    });

    ipcMain.on('rotate', (event, data) => {
      mainWindow.webContents.send('rotate', data);
    });

    ipcMain.on('shutdown', (event, data) => {
      app.quit();
    });
    ipcMain.on('restart', (event, data) => {
      app.relaunch();
      app.quit();
    });
  };
})();
