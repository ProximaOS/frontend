!(function () {
  'use strict';

  const { ipcRenderer } = require('electron');

  module.exports = {
    smsData: [],

    checkForUpdates: function () {
      return new Promise((resolve, reject) => {
        ipcRenderer.send('request-update-status', { webContentsId: id });
        ipcRenderer.on('update-status', (event, data) => {
          resolve(data);
        });
      });
    },

    sendSMS: function (to, message) {
      // TODO: GSM Telephony services
    },

    listenForIncomingSMS: function (to, message) {
      // TODO: GSM Telephony services
    }
  };
})();
