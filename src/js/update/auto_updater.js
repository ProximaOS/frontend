!(function () {
  'use strict';

  const { autoUpdater, BrowserWindow } = require('electron');
  const isDev = require('electron-is-dev');
  const path = require('path');

  module.exports = {
    updateWindow: null,

    init: function (mainWindow) {
      this.updateWindow = new BrowserWindow({
        icon: path.join(__dirname, '..', '..', 'internal', 'branding', 'icon.png'),
        title: 'OpenOrchid Updater',
        width: 320,
        height: 256,
        show: true,
        frame: false,
        webPreferences: {
          defaultFontFamily: 'system-ui',
          defaultMonospaceFontSize: 14,
          disableDialogs: true,
          devTools: isDev
        }
      });
      this.updateWindow.loadFile(path.join(__dirname, '..', '..', 'internal', 'update', 'index.html'));
      setTimeout(() => {
        this.updateWindow.hide();
        mainWindow.show();
      }, 10000);

      autoUpdater.setFeedURL({
        url: 'https://github.com/openorchid/frontend/releases/latest',
        headers: {}
      });
      autoUpdater.addListener('checking-for-update', () => {
        this.updateWindow.show();
        mainWindow.hide();
      });
      autoUpdater.addListener('update-not-available', () => {
        this.updateWindow.hide();
        mainWindow.show();
      });
      // autoUpdater.checkForUpdates();
    }
  };
})();
