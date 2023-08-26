!(function () {
  'use strict';

  const { BrowserWindow, ipcMain } = require('electron');
  const path = require('path');

  module.exports = function create () {
    const mainWindow = new BrowserWindow({
      icon: path.join(
        __dirname,
        '..',
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
            mainWindow.webContents.send('downloadprogress', {
              url: item.getURL(),
              suggestedFilename: item.getFilename(),
              lastModified: item.getLastModifiedTime(),
              size: item.getTotalBytes(),
              mime: item.getMimeType(),
              progress
            });
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

    fs.readdirSync(process.env.OPENORCHID_ADDONS).forEach(extensionName => {
      const extensionPath = path.join(process.env.OPENORCHID_ADDONS, extensionName);
      mainWindow.webContents.session.loadExtension(extensionPath);
    });

    // Close window
    ipcMain.on('close-window', () => {
      mainWindow.close();
    });

    // Maximize window
    ipcMain.on('maximize-window', () => {
      if (mainWindow.isMaximized()) {
        mainWindow.restore();
      } else {
        mainWindow.maximize();
      }
    });

    // Minimize window
    ipcMain.on('minimize-window', () => {
      mainWindow.minimize();
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
  };
})();
