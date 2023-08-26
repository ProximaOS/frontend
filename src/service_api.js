!(function (exports) {
  'use strict';

  const { ipcRenderer } = require('electron');

  const manifests = require('./manifests');
  const wifiManager = require('./services/wifi_manager');
  const bluetoothManager = require('./services/bluetooth');
  const storageManager = require('./services/storage_manager');
  const timeManager = require('./services/time_manager');
  const settings = require('./services/settings');
  const appsManager = require('./services/apps_manager');
  const childProcess = require('./services/child_process');
  const virtualManager = require('./services/virtual_manager');
  const powerManager = require('./power/power_manager');
  const rtlSdrListener = require('./fm_radio/rtlsdr_listener');
  const usersManager = require('./users/users_manager');
  const telephonyManager = require('./telephony/telephony_manager');
  const smsManager = require('./telephony/sms_manager');

  require('dotenv').config();

  // Create an object with functions to communicate with the parent renderer
  const api = {
    MESSAGE_PREFIX: 'openorchid',

    isWebview: false,

    ipcSend: ipcRenderer.send,
    ipcListener: ipcRenderer.on,
    process,

    sendMessage: function (message) {
    // Send a message to the parent renderer process
      this.ipcSend('message', message);
    },
    receiveMessage: function (callback) {
    // Listen for messages from the parent renderer process
      this.ipcListener('message-reply', function (event) {
        const { data } = event;
        callback(data);
      });
    },

    storageManager: {}
  };

  manifests.checkPermission('wifi-manage').then((result) => { if (result) { api.wifiManager = wifiManager; } });
  manifests.checkPermission('bluetooth').then((result) => { if (result) { api.bluetoothManager = bluetoothManager; } });
  manifests.checkPermission('settings').then((result) => { if (result) { api.settings = settings; } });
  manifests.checkPermission('storage').then((result) => { if (result) { api.storageManager = storageManager; } });
  manifests.checkPermission('device-storage:audio').then((result) => { if (result) { api.storageManager.audioAccess = true; } });
  manifests.checkPermission('device-storage:books').then((result) => { if (result) { api.storageManager.booksAccess = true; } });
  manifests.checkPermission('device-storage:downloads').then((result) => { if (result) { api.storageManager.downloadsAccess = true; } });
  manifests.checkPermission('device-storage:movies').then((result) => { if (result) { api.storageManager.moviesAccess = true; } });
  manifests.checkPermission('device-storage:music').then((result) => { if (result) { api.storageManager.musicAccess = true; } });
  manifests.checkPermission('device-storage:others').then((result) => { if (result) { api.storageManager.othersAccess = true; } });
  manifests.checkPermission('device-storage:photos').then((result) => { if (result) { api.storageManager.photosAccess = true; } });
  manifests.checkPermission('device-storage:home').then((result) => { if (result) { api.storageManager.homeAccess = true; } });
  manifests.checkPermission('device-storage:apps').then((result) => { if (result) { api.appsManager = appsManager; } });
  manifests.checkPermission('time').then((result) => { if (result) { api.timeManager = timeManager; } });
  manifests.checkPermission('virtualization').then((result) => { if (result) { api.virtualManager = virtualManager; } });
  manifests.checkPermission('child-process').then((result) => { if (result) { api.childProcess = childProcess; } });
  manifests.checkPermission('power').then((result) => { if (result) { api.powerManager = powerManager; } });
  manifests.checkPermission('fm-radio').then((result) => { if (result) { api.rtlSdrListener = rtlSdrListener; } });
  manifests.checkPermission('users').then((result) => { if (result) { api.usersManager = usersManager; } });
  manifests.checkPermission('telephony').then((result) => { if (result) { api.telephonyManager = telephonyManager; } });
  manifests.checkPermission('sms').then((result) => { if (result) { api.smsManager = smsManager; } });

  module.exports = api;
})(window);
