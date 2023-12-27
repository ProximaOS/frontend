!(function () {
  'use strict';

  const { ipcMain, app, webContents, autoUpdater } = require('electron');
  const path = require('path');
  const fs = require('fs');
  const Settings = require('../settings');

  module.exports = function (mainWindow, webview) {
    webview.webContents.on('crashed', () => {
      console.log('renderer process crashed'); // this will be called
    });

    webview.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
      if (details.resourceType === 'mainFrame') {
        Settings.getValue('privacy.do_not_track.enabled').then((value) => {
          if (details.requestHeaders.DNT !== value) {
            details.requestHeaders.DNT = value;
          }
        });
      }

      const data = { cancel: false, requestHeaders: details.requestHeaders };
      callback(data);
    });

    // Intercept download requests using the webContents' session
    webview.webContents.session.on('will-download', (event, item, webContents) => {
      // Send an event to the renderer process to get download path and decision
      webview.webContents.send('downloadrequest', {
        url: item.getURL(),
        suggestedFilename: item.getFilename(),
        lastModified: item.getLastModifiedTime(),
        size: item.getTotalBytes(),
        mime: item.getMimeType()
      });

      // Listen for the response from the renderer process
      ipcMain.once('download-response', (event, downloadData) => {
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
        webview.webContents.send('downloadprogress', {
          url: item.getURL(),
          suggestedFilename: item.getFilename(),
          lastModified: item.getLastModifiedTime(),
          size: item.getTotalBytes(),
          mime: item.getMimeType(),
          progress,
          state
        });
      });
    });

    webview.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
      webview.webContents.send('permissionrequest', {
        type: permission,
        origin: webContents.getURL(),
        title: webContents.getTitle()
      });
      ipcMain.once('permissionrequest', (event, data) => {
        callback(data.decision);
      });
    });

    // webview.webContents.session.setDisplayMediaRequestHandler((request, callback) => {
    //   const object = { video: request.frame };
    //   callback(object);
    // });

    autoUpdater.on('update-available', () => {
      webview.webContents.send('update-available');
    });
    autoUpdater.on('update-download-progress', (progressObj) => {
      webview.webContents.send('update-download-progress', progressObj);
    });
    autoUpdater.on('update-downloaded', () => {
      webview.webContents.send('update-downloaded');
    });

    ipcMain.on('request-update-status', (event) => {
      event.sender.send('update-status', autoUpdater.checkForUpdates());
    });

    fs.mkdirSync(path.join(process.env.ORCHID_APP_PROFILE, 'extensions'), {
      recursive: true
    });
    fs.readdirSync(process.env.OPENORCHID_ADDONS).forEach((extensionName) => {
      const extensionPath = path.join(process.env.OPENORCHID_ADDONS, extensionName);
      webview.webContents.session.loadExtension(extensionPath);
    });

    ipcMain.on('request-extension-list', (event, data) => {
      event.sender.send('extension-list', webview.webContents.session.getAllExtensions());
    });

    function valueTransition(value, target, callback) {
      const targetValue = target;
      const duration = 500; // 500ms transition time

      const startTime = performance.now();
      function animateValue() {
        const currentTime = performance.now();
        const progress = Math.min((currentTime - startTime) / duration, 1);

        const easedProgress = 0.5 - 0.5 * Math.cos(progress * Math.PI);
        const newValue = value + (targetValue - value) * easedProgress;
        callback(newValue);

        if (progress < 1) {
          setTimeout(animateValue, 1000 / 30);
        }
      }

      animateValue();
    }

    function resizeTransition(width, height) {
      const size = mainWindow.getSize();
      const previousWidth = size[0];
      const previousHeight = size[1];

      valueTransition(previousWidth, width, (newWidth) => {
        valueTransition(previousHeight, height, (newHeight) => {
          mainWindow.setSize(parseInt(newWidth), parseInt(newHeight));
        });
      });
    }

    ipcMain.on('message', (event, data) => {
      webview.webContents.send('message', data);
    });
    ipcMain.on('messagebox', (event, data) => {
      webview.webContents.send('messagebox', data);
    });
    ipcMain.on('openfile', (event, data) => {
      webview.webContents.send('openfile', data);
    });
    ipcMain.on('savefile', (event, data) => {
      webview.webContents.send('savefile', data);
    });
    ipcMain.on('shutdown', (event, data) => {
      app.quit();
    });
    ipcMain.on('restart', (event, data) => {
      app.relaunch();
      app.quit();
    });
    ipcMain.on('powerstart', (event, data) => {
      webview.webContents.send('powerstart', data);
    });
    ipcMain.on('powerend', (event, data) => {
      webview.webContents.send('powerend', data);
    });
    ipcMain.on('volumeup', (event, data) => {
      webview.webContents.send('volumeup', data);
    });
    ipcMain.on('volumedown', (event, data) => {
      webview.webContents.send('volumedown', data);
    });
    ipcMain.on('shortcut', (event, data) => {
      webview.webContents.send('shortcut', data);
    });
    ipcMain.on('input', (event, data) => {
      webview.webContents.sendInputEvent(data);
    });
    ipcMain.on('rotate', (event, data) => {
      webview.webContents.send('rotate', data);
      const size = mainWindow.getSize();
      if (data.rotation === '90deg' || data.rotation === '-90deg') {
        resizeTransition(size[1], size[0]);
      } else {
        resizeTransition(size[0], size[1]);
      }
    });
    ipcMain.on('mediaplay', (event, data) => {
      webview.webContents.send('mediaplay', data);
    });
    ipcMain.on('mediapause', (event, data) => {
      webview.webContents.send('mediapause', data);
    });
    ipcMain.on('webdrag', (event, data) => {
      webview.webContents.send('webdrag', data);
    });
    ipcMain.on('webdrop', (event, data) => {
      webview.webContents.send('webdrop', data);
    });
    ipcMain.on('devicepickup', (event, data) => {
      webview.webContents.send('devicepickup', data);
    });
    ipcMain.on('deviceputdown', (event, data) => {
      webview.webContents.send('deviceputdown', data);
    });
    ipcMain.on('settingschange', (event, data) => {
      webview.webContents.send('settingschange', data);
    });
    ipcMain.on('mediadevicechange', (event, data) => {
      webview.webContents.send('mediadevicechange', data);
    });
    ipcMain.on('narrate', (event, data) => {
      webview.webContents.send('narrate', data);
    });
    ipcMain.on('screenshot', (event, data) => {
      if (data.webContentsId) {
        const wc = webContents.fromId(data.webContentsId);
        wc.capturePage().then((image) => {
          event.sender.send('screenshotted', {
            webContentsId: data.webContentsId,
            imageDataURL: image.toDataURL()
          });
        });
      } else {
        webview.webContents.capturePage().then((image) => {
          event.sender.send('screenshotted', {
            webContentsId: data.webContentsId,
            imageDataURL: image.toDataURL()
          });
        });
      }
    });

    ipcMain.on('requestlogin', (event, data) => {
      webview.webContents.send('requestlogin', data);
    });
  };
})();
