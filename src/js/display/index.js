!(function () {
  'use strict';

  const { ipcRenderer } = require('electron');

  module.exports = {
    screenshot: function (id) {
      return new Promise((resolve, reject) => {
        ipcRenderer.send('screenshot', { webContentsId: id });
        ipcRenderer.on('screenshotted', (event, data) => {
          resolve(data);
        });
      });
    }
  };
})();
