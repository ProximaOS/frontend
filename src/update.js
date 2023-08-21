!(function () {

'use strict';

const { autoUpdater, BrowserWindow } = require('electron');
const isDev = require("electron-is-dev");
const path = require('path');

module.exports = {
  updateWindow: null,

  init: function () {
    this.updateWindow = new BrowserWindow({
      icon: path.join(__dirname, "..", "icons", "icon.png"),
      title: "OpenOrchid Updater",
      width: 320,
      height: 256,
      show: false,
      frame: false,
      webPreferences: {
        defaultFontFamily: "system-ui",
        defaultMonospaceFontSize: 14,
        disableDialogs: true,
        devTools: isDev,
        preload: path.join(__dirname, 'src', 'update.js')
      },
    });
    this.updateWindow.loadURL("openorchid://updater/index.html");

    autoUpdater.setFeedURL("https://www.example.com/updates/");
    autoUpdater.addListener("checking-for-update", () => {
      this.updateWindow.show();
    });
    autoUpdater.addListener("update-not-available", () => {
      this.updateWindow.hide();
    });
    // autoUpdater.checkForUpdates();
  }
};

})();
