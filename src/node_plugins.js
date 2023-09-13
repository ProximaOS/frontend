!(function (exports) {
  'use strict';

  const { ipcRenderer, contextBridge } = require('electron');
  const manifests = require('./browser/manifest_permissions');
  const WifiManager = require('./openorchid-wifi');
  const BluetoothManager = require('./openorchid-bluetooth');
  const StorageManager = require('./openorchid-storage');
  const TimeManager = require('./openorchid-time');
  const Settings = require('./openorchid-settings');
  const AppsManager = require('./openorchid-webapps');
  const ChildProcess = require('./openorchid-child-process');
  const VirtualManager = require('./openorchid-virtual');
  const PowerManager = require('./openorchid-power');
  const RtlsdrReciever = require('./openorchid-rtlsdr');
  const UsersManager = require('./openorchid-users');
  const TelephonyManager = require('./openorchid-telephony');
  const SmsManager = require('./openorchid-sms');

  require('dotenv').config();

  function registerEvent (ipcName, windowName) {
    ipcRenderer.on(ipcName, (event, data) => {
      const customEvent = new CustomEvent(windowName, {
        detail: data,
        bubbles: true,
        cancelable: true
      });
      console.log(data);
      window.dispatchEvent(customEvent);
      console.log(customEvent);
    });
  }

  registerEvent('message', 'ipc-message');
  registerEvent('shutdown', 'shutdown');
  registerEvent('restart', 'restart');
  registerEvent('powerstart', 'powerstart');
  registerEvent('powerend', 'powerend');
  registerEvent('volumeup', 'volumeup');
  registerEvent('volumedown', 'volumedown');
  registerEvent('shortcut', 'shortcut');
  registerEvent('rotate', 'rotate');
  registerEvent('mediaplay', 'mediaplay');
  registerEvent('mediapause', 'mediapause');
  registerEvent('downloadrequest', 'downloadrequest');
  registerEvent('downloadprogress', 'downloadprogress');
  registerEvent('permissionrequest', 'permissionrequest');
  registerEvent('overheat', 'overheat');
  registerEvent('devicepickup', 'devicepickup');
  registerEvent('deviceputdown', 'deviceputdown');

  const Environment = {
    type: process.env.NODE_ENV,
    currentDir: process.cwd(),
    dirName: () => __dirname
  };

  const IPCRenderManager = {
    send: ipcRenderer.send,
    sendToHost: ipcRenderer.sendToHost,
    sendSync: ipcRenderer.sendSync
  };

  // Create an object with functions to communicate with the parent renderer
  const api = {
    MESSAGE_PREFIX: 'openorchid',

    Environment,
    IPC: IPCRenderManager,

    AudioManager: null,
    DisplayManager: null,
    BrightnessManager: null,
    WifiManager: null,
    BluetoothManager: null,
    NfcManager: null,
    Settings: null,
    InputManager: null,
    StorageManager: {},
    AppsManager: null,
    AddonsManager: null,
    TimeManager: null,
    VirtualManager: null,
    VirtualCursor: null,
    ChildProcess: null,
    PowerManager: null,
    RtlsdrReciever: null,
    UsersManager: null,
    TelephonyManager: null,
    SmsManager: null,
    TasksManager: null
  };

  // TODO: B2G Backward Compatibility
  contextBridge.exposeInMainWorld('apiDaemon', {
    requestPermission: async (permission) => {
      const result = await manifests.checkPermission(permission);
      return result;
    },
    ...api
  });

  function verifyAccess (permission, mapName, value) {
    manifests.checkPermission(permission).then((result) => {
      if (result) {
        api[mapName] = value;
        contextBridge.exposeInMainWorld(mapName, value);
      }
    });
  }

  function setAccess (permission, mapName, property, value) {
    manifests.checkPermission(permission).then((result) => {
      if (result) {
        api[mapName][property] = value;
      }
    });
  }

  verifyAccess('environment', 'Environment', Environment);
  verifyAccess('ipc', 'IPC', IPCRenderManager);
  verifyAccess('wifi-manage', 'WifiManager', WifiManager);
  verifyAccess('bluetooth', 'BluetoothManager', BluetoothManager);
  verifyAccess('settings', 'Settings', Settings);
  verifyAccess('storage', 'StorageManager', StorageManager);
  verifyAccess('device-storage:apps', 'AppsManager', AppsManager);
  verifyAccess('time', 'TimeManager', TimeManager);
  verifyAccess('virtualization', 'VirtualManager', VirtualManager);
  verifyAccess('child-process', 'ChildProcess', ChildProcess);
  verifyAccess('power', 'PowerManager', PowerManager);
  verifyAccess('fm-radio', 'RtlsdrReciever', RtlsdrReciever);
  verifyAccess('users', 'UsersManager', UsersManager);
  verifyAccess('telephony', 'TelephonyManager', TelephonyManager);
  verifyAccess('sms', 'SmsManager', SmsManager);

  setAccess('device-storage:audio', 'StorageManager', 'audioAccess', true);
  setAccess('device-storage:books', 'StorageManager', 'booksAccess', true);
  setAccess('device-storage:downloads', 'StorageManager', 'downloadsAccess', true);
  setAccess('device-storage:movies', 'StorageManager', 'moviesAccess', true);
  setAccess('device-storage:music', 'StorageManager', 'musicAccess', true);
  setAccess('device-storage:others', 'StorageManager', 'othersAccess', true);
  setAccess('device-storage:photos', 'StorageManager', 'photosAccess', true);
  setAccess('device-storage:home', 'StorageManager', 'homeAccess', true);
})(window);
