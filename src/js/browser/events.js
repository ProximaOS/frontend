!(function () {
  'use strict';

  const { ipcMain, app, webContents } = require('electron');
  const path = require('path');
  const fs = require('fs');
  const electronLocalshortcut = require('electron-localshortcut');

  module.exports = function (mainWindow) {
    mainWindow.webContents.on('crashed', () => {
      console.log('renderer process crashed'); // this will be called
    });

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
          const progress = item.getReceivedBytes() / item.getTotalBytes();
          mainWindow.webContents.send('downloadprogress', {
            url: item.getURL(),
            suggestedFilename: item.getFilename(),
            lastModified: item.getLastModifiedTime(),
            size: item.getTotalBytes(),
            mime: item.getMimeType(),
            progress,
            state
          });
        });
      }
    );

    mainWindow.webContents.session.setPermissionRequestHandler(
      (webContents, permission, callback) => {
        mainWindow.webContents.send('permissionrequest', {
          type: permission,
          origin: webContents.getURL(),
          title: webContents.getTitle()
        });
        ipcMain.once('permissionrequest', (event, data) => {
          callback(data.decision);
        });
      }
    );

    electronLocalshortcut.register(mainWindow, ['Ctrl+R', 'F5'], () => {
      mainWindow.reload();
    });
    electronLocalshortcut.register(mainWindow, ['Ctrl+F', 'F11'], () => {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
    });
    electronLocalshortcut.register(mainWindow, ['Ctrl+Shift+I', 'F12'], () => {
      mainWindow.webContents.openDevTools();
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

    fs.mkdirSync(path.join(process.env.ORCHID_APP_PROFILE, 'extensions'), {
      recursive: true
    });
    fs.readdirSync(process.env.OPENORCHID_ADDONS).forEach((extensionName) => {
      const extensionPath = path.join(
        process.env.OPENORCHID_ADDONS,
        extensionName
      );
      mainWindow.webContents.session.loadExtension(extensionPath);
    });

    ipcMain.on('request-extension-list', (event, data) => {
      mainWindow.webContents.send(
        'extension-list',
        mainWindow.webContents.session.getAllExtensions()
      );
    });

    ipcMain.on('message', (event, data) => {
      mainWindow.webContents.send('message', data);
    });
    ipcMain.on('messagebox', (event, data) => {
      mainWindow.webContents.send('messagebox', data);
    });
    ipcMain.on('openfile', (event, data) => {
      mainWindow.webContents.send('openfile', data);
    });
    ipcMain.on('savefile', (event, data) => {
      mainWindow.webContents.send('savefile', data);
    });
    ipcMain.on('shutdown', (event, data) => {
      app.quit();
    });
    ipcMain.on('restart', (event, data) => {
      app.relaunch();
      app.quit();
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
    ipcMain.on('mediaplay', (event, data) => {
      mainWindow.webContents.send('mediaplay', data);
    });
    ipcMain.on('mediapause', (event, data) => {
      mainWindow.webContents.send('mediapause', data);
    });
    ipcMain.on('webdrag', (event, data) => {
      mainWindow.webContents.send('webdrag', data);
    });
    ipcMain.on('webdrop', (event, data) => {
      mainWindow.webContents.send('webdrop', data);
    });
    ipcMain.on('devicepickup', (event, data) => {
      mainWindow.webContents.send('devicepickup', data);
    });
    ipcMain.on('deviceputdown', (event, data) => {
      mainWindow.webContents.send('deviceputdown', data);
    });
    ipcMain.on('settingschange', (event, data) => {
      mainWindow.webContents.send('settingschange', data);
    });
    ipcMain.on('narrate', (event, data) => {
      mainWindow.webContents.send('narrate', data);
    });
    ipcMain.on('screenshot', (event, data) => {
      if (data.webContentsId) {
        const wc = webContents.fromId(data.webContentsId);
        wc.capturePage().then((image) => {
          mainWindow.webContents.send('screenshotted', {
            webContentsId: data.webContentsId,
            imageDataURL: image.toDataURL()
          });
        });
      } else {
        mainWindow.webContents.capturePage().then((image) => {
          mainWindow.webContents.send('screenshotted', {
            webContentsId: data.webContentsId,
            imageDataURL: image.toDataURL()
          });
        });
      }
    });
  };
})();
