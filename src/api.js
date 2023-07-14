const { ipcRenderer } = require('electron');

const permissions = require('./permissions');
const wifiManager = require('./apis/wifi_manager');
const bluetoothManager = require('./apis/bluetooth');
const cellularManager = require('./apis/cellular_manager');
const storageManager = require('./apis/storage_manager');
const timeManager = require('./apis/time_manager');
const settings = require('./apis/settings');
const appManager = require('./apis/app_manager');

require('dotenv').config();

// Create an object with functions to communicate with the parent renderer
const api = {
  MESSAGE_PREFIX: 'openorchid',

  isWebview: false,
  ipcSender: ipcRenderer.send,
  ipcListener: ipcRenderer.on,

  sendMessage: function (message) {
    // Send a message to the parent renderer process
    this.ipcSender('message', message);
  },
  receiveMessage: function (callback) {
    // Listen for messages from the parent renderer process
    this.ipcListener('message-reply', async function (event) {
      const { data } = event;
      callback(data);
    });
  },

  checkPermission: permissions.checkPermission,
  requestPermission: permissions.requestPermission,
  permissionListener: permissions.permissionListener,

  wifiManager: wifiManager,
  bluetoothManager: bluetoothManager,
  cellularManager: cellularManager,
  storageManager: storageManager,
  timeManager: timeManager,
  settings: settings,
  appManager: appManager,
};

module.exports = api;
