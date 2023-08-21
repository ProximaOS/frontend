!(function (exports) {
  'use strict';

  const { ipcRenderer } = require('electron');

  const permissions = require('./permissions');
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
    }
  };

  if (permissions.checkPermission('wifi-manage')) { api.wifiManager = wifiManager; }
  if (permissions.checkPermission('bluetooth')) { api.bluetoothManager = bluetoothManager; }
  if (permissions.checkPermission('settings')) { api.settings = settings; }
  if (permissions.checkPermission('storage')) { api.storageManager = storageManager; }
  if (permissions.checkPermission('device-storage:apps')) { api.appsManager = appsManager; }
  if (permissions.checkPermission('time')) { api.timeManager = timeManager; }
  if (permissions.checkPermission('virtualization')) { api.virtualManager = virtualManager; }
  if (permissions.checkPermission('child-process')) { api.childProcess = childProcess; }
  if (permissions.checkPermission('power')) { api.powerManager = powerManager; }
  if (permissions.checkPermission('rtlsdr')) { api.rtlSdrListener = rtlSdrListener; }
  if (permissions.checkPermission('users')) { api.usersManager = usersManager; }
  if (permissions.checkPermission('telephony')) { api.telephonyManager = telephonyManager; }
  if (permissions.checkPermission('sms')) { api.smsManager = smsManager; }

  module.exports = api;
})(window);
