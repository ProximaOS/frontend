const { ipcRenderer } = require('electron');

!(function (exports) {
  'use strict';

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

  // Create an object with functions to communicate with the parent renderer
  const api = {
    MESSAGE_PREFIX: 'openorchid',

    IPC: ipcRenderer,

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

  manifests.checkPermission('wifi-manage').then((result) => {
    if (result) api.WifiManager = WifiManager;
    Object.assign(exports, api);
  });
  manifests.checkPermission('bluetooth').then((result) => {
    if (result) api.BluetoothManager = BluetoothManager;
    Object.assign(exports, api);
  });
  manifests.checkPermission('settings').then((result) => {
    if (result) api.Settings = Settings;
    Object.assign(exports, api);
  });
  manifests.checkPermission('storage').then((result) => {
    if (result) api.StorageManager = StorageManager;
    Object.assign(exports, api);
  });
  manifests.checkPermission('device-storage:audio').then((result) => {
    if (result) api.StorageManager.audioAccess = true;
    Object.assign(exports, api);
  });
  manifests.checkPermission('device-storage:books').then((result) => {
    if (result) api.StorageManager.booksAccess = true;
    Object.assign(exports, api);
  });
  manifests.checkPermission('device-storage:downloads').then((result) => {
    if (result) api.StorageManager.downloadsAccess = true;
    Object.assign(exports, api);
  });
  manifests.checkPermission('device-storage:movies').then((result) => {
    if (result) api.StorageManager.moviesAccess = true;
    Object.assign(exports, api);
  });
  manifests.checkPermission('device-storage:music').then((result) => {
    if (result) api.StorageManager.musicAccess = true;
    Object.assign(exports, api);
  });
  manifests.checkPermission('device-storage:others').then((result) => {
    if (result) api.StorageManager.othersAccess = true;
    Object.assign(exports, api);
  });
  manifests.checkPermission('device-storage:photos').then((result) => {
    if (result) api.StorageManager.photosAccess = true;
    Object.assign(exports, api);
  });
  manifests.checkPermission('device-storage:home').then((result) => {
    if (result) api.StorageManager.homeAccess = true;
    Object.assign(exports, api);
  });
  manifests.checkPermission('device-storage:apps').then((result) => {
    if (result) api.AppsManager = AppsManager;
    Object.assign(exports, api);
  });
  manifests.checkPermission('time').then((result) => {
    if (result) api.TimeManager = TimeManager;
    Object.assign(exports, api);
  });
  manifests.checkPermission('virtualization').then((result) => {
    if (result) api.VirtualManager = VirtualManager;
    Object.assign(exports, api);
  });
  manifests.checkPermission('child-process').then((result) => {
    if (result) api.ChildProcess = ChildProcess;
    Object.assign(exports, api);
  });
  manifests.checkPermission('power').then((result) => {
    if (result) api.PowerManager = PowerManager;
    Object.assign(exports, api);
  });
  manifests.checkPermission('fm-radio').then((result) => {
    if (result) api.RtlsdrReciever = RtlsdrReciever;
    Object.assign(exports, api);
  });
  manifests.checkPermission('users').then((result) => {
    if (result) api.UsersManager = UsersManager;
    Object.assign(exports, api);
  });
  manifests.checkPermission('telephony').then((result) => {
    if (result) api.TelephonyManager = TelephonyManager;
    Object.assign(exports, api);
  });
  manifests.checkPermission('sms').then((result) => {
    if (result) api.SmsManager = SmsManager;
    Object.assign(exports, api);
  });
})(window);
