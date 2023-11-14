!(function (exports) {
  'use strict';

  const { ipcRenderer, contextBridge } = require('electron');
  const manifests = require('../src/api/manifest_permissions');
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
  const DeviceInformation = require('../src/device/device_info');
  const appConfig = require('../package.json');

  require('dotenv').config();

  function registerEvent(ipcName, windowName) {
    ipcRenderer.on(ipcName, (event, data) => {
      const customEvent = new CustomEvent(windowName, {
        detail: data,
        bubbles: true,
        cancelable: true
      });
      window.dispatchEvent(customEvent);
    });
  }

  registerEvent('message', 'ipc-message');
  registerEvent('messagebox', 'messagebox');
  registerEvent('openfile', 'openfile');
  registerEvent('savefile', 'savefile');
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
  registerEvent('mediadevicechange', 'mediadevicechange');
  registerEvent('screencapturechange', 'screencapturechange');
  registerEvent('webdrag', 'webdrag');
  registerEvent('webdrop', 'webdrop');
  registerEvent('downloadrequest', 'downloadrequest');
  registerEvent('downloadprogress', 'downloadprogress');
  registerEvent('permissionrequest', 'permissionrequest');
  registerEvent('overheat', 'overheat');
  registerEvent('devicepickup', 'devicepickup');
  registerEvent('deviceputdown', 'deviceputdown');
  registerEvent('screenshotted', 'screenshotted');
  registerEvent('narrate', 'narrate');

  registerEvent('requestlogin', 'requestlogin');

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

    DeviceInformation: null,
    AudioManager: null,
    DisplayManager: null,
    BrightnessManager: null,
    WifiManager: null,
    BluetoothManager: null,
    NfcManager: null,
    Settings: null,
    InputManager: null,
    SDCardManager: {},
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

  function verifyAccess(permission, mapName, value) {
    const result = manifests.checkPermission(permission);
    if (result) {
      api[mapName] = value;
      contextBridge.exposeInMainWorld(mapName, value);
    }
  }

  verifyAccess('environment', 'Environment', Environment);
  verifyAccess('ipc', 'IPC', IPCRenderManager);
  verifyAccess('device-info', 'DeviceInformation', DeviceInformation);
  verifyAccess('wifi-manage', 'WifiManager', WifiManager);
  verifyAccess('bluetooth', 'BluetoothManager', BluetoothManager);
  verifyAccess('settings', 'Settings', Settings);
  verifyAccess('storage', 'SDCardManager', SDCardManager);
  verifyAccess('device-storage:apps', 'AppsManager', AppsManager);
  verifyAccess('time', 'TimeManager', TimeManager);
  verifyAccess('virtualization', 'VirtualManager', VirtualManager);
  verifyAccess('child-process', 'ChildProcess', ChildProcess);
  verifyAccess('power', 'PowerManager', PowerManager);
  verifyAccess('fm-radio', 'RtlsdrReciever', RtlsdrReciever);
  verifyAccess('users', 'UsersManager', UsersManager);
  verifyAccess('telephony', 'TelephonyManager', TelephonyManager);
  verifyAccess('display', 'DisplayManager', DisplayManager);
  verifyAccess('sms', 'SmsManager', SmsManager);

  ipcRenderer.send('mediadevicechange', {});

  // contextBridge.exposeInMainWorld('_open', require('./v8js/open'));
  const getUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
  contextBridge.exposeInMainWorld('sessionOverride', {
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

  function playSpatializedAudio(x, y, z, filePath) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    fetch(filePath)
      .then((response) => response.arrayBuffer())
      .then((data) => audioContext.decodeAudioData(data))
      .then((audioBuffer) => {
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;

        const panner = audioContext.createPanner();
        panner.panningModel = 'HRTF';
        panner.distanceModel = 'inverse';
        panner.refDistance = 1;
        panner.maxDistance = 10000;
        panner.rolloffFactor = 1;
        panner.coneInnerAngle = 360;
        panner.coneOuterAngle = 0;
        panner.coneOuterGain = 0;

        panner.setPosition(x, y, z);

        source.connect(panner);
        panner.connect(audioContext.destination);

        source.start();
      })
      .catch((error) => console.error('Error loading audio:', error));
  }

  document.addEventListener('click', (event) => {
    if (['A', 'BUTTON', 'LI', 'INPUT'].indexOf(event.target.nodeName) === -1) {
      return;
    }
    const x = (event.clientX / window.innerWidth) - 0.5;
    const y = ((event.clientY / window.innerHeight) - 0.5) * -1;

    playSpatializedAudio(x, y, 0.1, `http://shared.localhost:${location.port}/resources/sounds/click.wav`);
  });

  document.addEventListener('dragstart', function (event) {
    event.preventDefault();

    ipcRenderer.send('webdrag', {
      left: event.target.getBoundingClientRect().left,
      top: event.target.getBoundingClientRect().top,
      width: event.target.getBoundingClientRect().width,
      height: event.target.getBoundingClientRect().height
    });
  });

  document.addEventListener('pointerup', function (event) {
    ipcRenderer.send('webdrop', {
      left: event.target.getBoundingClientRect().left,
      top: event.target.getBoundingClientRect().top,
      width: event.target.getBoundingClientRect().width,
      height: event.target.getBoundingClientRect().height
    });
  });

  document.addEventListener('DOMContentLoaded', function () {
    require('./modules/image_handler');
    require('./modules/keyboard');
    require('./modules/media_playback');
    require('./modules/narrator');
    require('./modules/privacy_indicators');
    require('./modules/seekbars_and_switches');
    require('./modules/settings_handler');
    // require('./modules/stylesheet_ensurer');
    require('./modules/videoplayer');
    require('./modules/picture_in_picture');
    require('./modules/webview_handler');
  });

  document.addEventListener('scroll', function () {
    ipcRenderer.sendToHost('scroll', {
      left: document.scrollingElement.scrollLeft,
      top: document.scrollingElement.scrollTop
    });
  });

  ['pointerup', 'keyup', 'keydown'].forEach((eventType) => {
    document.addEventListener(eventType, function () {
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
      console.log(event.target.getAttribute('title'));
    } else {
      ipcRenderer.send('message', {
        type: 'title',
        action: 'hide'
      });
    }
  });
})(window);
