!(function (exports) {
  'use strict';

  const { ipcRenderer, contextBridge } = require('electron');
  const permissions = require('../src/permissions');
  const WifiManager = require('../src/wifi');
  const BluetoothManager = require('../src/bluetooth');
  const SDCardManager = require('../src/storage');
  const TimeManager = require('../src/time');
  const Settings = require('../src/settings');
  const AppsManager = require('../src/webapps');
  const ChildProcess = require('../src/child_process');
  const VirtualManager = require('../src/virtualization');
  const PowerManager = require('../src/power');
  const RtlsdrReciever = require('../src/rtlsdr');
  const UsersManager = require('../src/users');
  const TelephonyManager = require('../src/telephony');
  const DisplayManager = require('../src/display');
  const SmsManager = require('../src/sms');
  const TasksManager = require('../src/tasks');
  const DeviceInformation = require('../src/device/device_info');
  const UpdateManager = require('../src/update');
  const appConfig = require('../package.json');

  require('dotenv').config();

  function registerEvent (ipcName, windowName) {
    ipcRenderer.on(ipcName, (event, data) => {
      const customEvent = new CustomEvent(windowName, {
        detail: data,
        bubbles: true,
        cancelable: true
      });
      window.dispatchEvent(customEvent);
    });
  }

  let eventRegistery = new Map();
  eventRegistery.set('message', 'ipc-message');
  eventRegistery.set('messagebox', 'messagebox');
  eventRegistery.set('openfile', 'openfile');
  eventRegistery.set('savefile', 'savefile');
  eventRegistery.set('shutdown', 'shutdown');
  eventRegistery.set('restart', 'restart');
  eventRegistery.set('powerstart', 'powerstart');
  eventRegistery.set('powerend', 'powerend');
  eventRegistery.set('volumeup', 'volumeup');
  eventRegistery.set('volumedown', 'volumedown');
  eventRegistery.set('shortcut', 'shortcut');
  eventRegistery.set('rotate', 'rotate');
  eventRegistery.set('mediaplay', 'mediaplay');
  eventRegistery.set('mediapause', 'mediapause');
  eventRegistery.set('mediadevicechange', 'mediadevicechange');
  eventRegistery.set('screencapturechange', 'screencapturechange');
  eventRegistery.set('downloadrequest', 'downloadrequest');
  eventRegistery.set('downloadprogress', 'downloadprogress');
  eventRegistery.set('permissionrequest', 'permissionrequest');
  eventRegistery.set('overheat', 'overheat');
  eventRegistery.set('devicepickup', 'devicepickup');
  eventRegistery.set('deviceputdown', 'deviceputdown');
  eventRegistery.set('screenshotted', 'screenshotted');
  eventRegistery.set('input', 'keyboardinput');
  eventRegistery.set('narrate', 'narrate');
  eventRegistery.set('update-available', 'update-available');
  eventRegistery.set('update-download-progress', 'update-download-progress');
  eventRegistery.set('update-downloaded', 'update-downloaded');
  eventRegistery.set('requestlogin', 'requestlogin');
  for (const [key, value] of eventRegistery) {
    registerEvent(key, value);
  }
  eventRegistery = null;

  const Environment = {
    type: process.env.ORCHID_ENVIRONMENT,
    debugPort: process.debugPort,
    currentDir: process.cwd(),
    dirName: () => __dirname,
    version: appConfig.version,
    engineVersion: process.versions.chrome,
    argv: process.argv,
    argv0: process.argv0,
    platform: process.platform,
    arch: process.arch,
    execArgv: process.execArgv,
    execPath: process.execPath
  };

  const IPC = {
    send: ipcRenderer.send,
    sendToHost: ipcRenderer.sendToHost,
    sendSync: ipcRenderer.sendSync
  };

  function verifyAccess (permission, value) {
    const result = permissions.checkPermission(permission);
    if (result) {
      contextBridge.exposeInMainWorld(value[0], value[1]);
    }
  }

  let apiRegistery = {};
  apiRegistery.environment = ['Environment', Environment];
  apiRegistery.ipc = ['IPC', IPC];
  apiRegistery['device-info'] = ['DeviceInformation', DeviceInformation];
  apiRegistery['wifi-manage'] = ['WifiManager', WifiManager];
  apiRegistery.bluetooth = ['BluetoothManager', BluetoothManager];
  apiRegistery.settings = ['Settings', Settings];
  apiRegistery.storage = ['SDCardManager', SDCardManager];
  apiRegistery['webapps-manage'] = ['AppsManager', AppsManager];
  apiRegistery.time = ['TimeManager', TimeManager];
  apiRegistery.virtualization = ['VirtualManager', VirtualManager];
  apiRegistery['child-process'] = ['ChildProcess', ChildProcess];
  apiRegistery.power = ['PowerManager', PowerManager];
  apiRegistery['fm-radio'] = ['RtlsdrReciever', RtlsdrReciever];
  apiRegistery.users = ['UsersManager', UsersManager];
  apiRegistery.telephony = ['TelephonyManager', TelephonyManager];
  apiRegistery.display = ['DisplayManager', DisplayManager];
  apiRegistery.sms = ['SmsManager', SmsManager];
  apiRegistery['tasks-manage'] = ['TasksManager', TasksManager];
  apiRegistery.update = ['UpdateManager', UpdateManager];

  let apiEntries = Object.entries(apiRegistery);
  for (let i = 0, length = apiEntries.length; i < length; i++) {
    const [key, value] = apiEntries[i];
    verifyAccess(key, value);
  }
  apiEntries = null;
  apiRegistery = null;

  ipcRenderer.send('mediadevicechange', {});

  const getUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
  contextBridge.exposeInMainWorld('sessionOverride', {
    open: require('./vanilla/open'),
    Notification: require('./vanilla/notifications'),
    alert: require('./vanilla/modal_dialogs').alert,
    confirm: require('./vanilla/modal_dialogs').confirm,
    prompt: require('./vanilla/modal_dialogs').prompt,
    getUserMedia: async function (constraints) {
      ipcRenderer.send('mediadevicechange', constraints);
      const stream = await getUserMedia(constraints);

      stream.addEventListener('inactive', () => {
        ipcRenderer.send('mediadevicechange', {});
      });

      return stream;
    }
  });

  const clickSound = new Audio(`http://shared.localhost:${location.port}/resources/sounds/click.wav`);
  clickSound.crossOrigin = 'anonymous';

  document.addEventListener('click', (event) => {
    if (['A', 'BUTTON', 'LI', 'INPUT'].indexOf(event.target.nodeName) === -1) {
      return;
    }

    clickSound.currentTime = 0;
    clickSound.play()
  });

  document.addEventListener('DOMContentLoaded', function () {
    require('./modules/keyboard');
    require('./modules/media_playback');
    require('./modules/narrator');
    require('./modules/privacy_indicators');
    require('./modules/seekbars_and_switches');
    require('./modules/settings_handler');
    require('./modules/videoplayer');
    require('./modules/picture_in_picture');
    require('./modules/webview_handler');
    require('./modules/keybinds');
    require('./modules/visibility_state');
  });

  function updateTextSelection () {
    const selectedText = window.getSelection().toString();

    if (selectedText.length > 0) {
      const selectedRange = window.getSelection().getRangeAt(0);
      const boundingRect = selectedRange.getBoundingClientRect();

      const position = {
        top: boundingRect.top,
        left: boundingRect.left
      };

      const size = {
        width: boundingRect.width,
        height: boundingRect.height
      };

      // Call your function with the provided arguments
      ipcRenderer.send('message', {
        type: 'textselection',
        action: 'show',
        position,
        size,
        selectedText
      });
    } else {
      ipcRenderer.send('message', {
        type: 'textselection',
        action: 'hide'
      });
    }
  }

  ['pointerdown', 'pointermove', 'pointerup', 'keyup', 'keydown', 'wheel'].forEach((eventType) => {
    document.addEventListener(eventType, function () {
      updateTextSelection();
    });
  });

  document.addEventListener('mouseover', (event) => {
    if (event.target.nodeName !== 'WEBVIEW' && event.target.getAttribute('title')) {
      ipcRenderer.send('message', {
        type: 'title',
        action: 'show',
        originType: location.origin.includes(`system.localhost:${location.port}`) ? 'system' : 'webapp',
        position: {
          left: event.clientX,
          top: event.clientY
        },
        title: event.target.getAttribute('title')
      });
    } else {
      ipcRenderer.send('message', {
        type: 'title',
        action: 'hide'
      });
    }
  });
})(window);
