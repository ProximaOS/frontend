!(function (exports) {
  'use strict';

  const { ipcRenderer, contextBridge } = require('electron');
  const musicMetadata = require('music-metadata-browser');
  const mime = require('mime');
  const manifests = require('../src/js/api/manifest_permissions');
  const WifiManager = require('../src/js/wifi');
  const BluetoothManager = require('../src/js/bluetooth');
  const SDCardManager = require('../src/js/storage');
  const TimeManager = require('../src/js/time');
  const Settings = require('../src/js/settings');
  const AppsManager = require('../src/js/webapps');
  const ChildProcess = require('../src/js/child_process');
  const VirtualManager = require('../src/js/virtualization');
  const PowerManager = require('../src/js/power');
  const RtlsdrReciever = require('../src/js/rtlsdr');
  const UsersManager = require('../src/js/users');
  const TelephonyManager = require('../src/js/telephony');
  const DisplayManager = require('../src/js/display');
  const SmsManager = require('../src/js/sms');
  const DeviceInformation = require('../src/js/device/device_info');

  require('dotenv').config();

  async function importJavascript(url) {
    try {
      const response = await fetch(url);
      const jsCode = await response.text();

      // Using Function (safer than eval)
      const func = new Function(jsCode);
      func();
    } catch (error) {
      console.error('Error fetching or executing JS:', error);
    }
  }

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

  // TODO: B2G Backward Compatibility
  contextBridge.exposeInMainWorld('apiDaemon', {
    requestPermission: async (permission) => {
      const result = await manifests.checkPermission(permission);
      return result;
    },
    ...api
  });

  function verifyAccess(permission, mapName, value) {
    manifests.checkPermission(permission).then((result) => {
      if (result) {
        api[mapName] = value;
        contextBridge.exposeInMainWorld(mapName, value);
      }
    });
  }

  function setAccess(permission, mapName, property, value) {
    manifests.checkPermission(permission).then((result) => {
      if (result) {
        api[mapName][property] = value;
      }
    });
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

  setAccess('device-storage:audio', 'SDCardManager', 'audioAccess', true);
  setAccess('device-storage:books', 'SDCardManager', 'booksAccess', true);
  setAccess(
    'device-storage:downloads',
    'SDCardManager',
    'downloadsAccess',
    true
  );
  setAccess('device-storage:movies', 'SDCardManager', 'moviesAccess', true);
  setAccess('device-storage:music', 'SDCardManager', 'musicAccess', true);
  setAccess('device-storage:others', 'SDCardManager', 'othersAccess', true);
  setAccess('device-storage:photos', 'SDCardManager', 'photosAccess', true);
  setAccess('device-storage:home', 'SDCardManager', 'homeAccess', true);

  // contextBridge.exposeInMainWorld('_open', require('./v8js/open'));
  contextBridge.exposeInMainWorld(
    'OrchidNotification',
    require('./v8js/notifications')
  );
  contextBridge.exposeInMainWorld(
    '_alert',
    require('./v8js/modal_dialogs').alert
  );
  contextBridge.exposeInMainWorld(
    '_confirm',
    require('./v8js/modal_dialogs').confirm
  );
  contextBridge.exposeInMainWorld(
    '_prompt',
    require('./v8js/modal_dialogs').prompt
  );

  const clickSound = new Audio(
    `http://shared.localhost:${location.port}/resources/sounds/click.wav`
  );

  document.addEventListener('click', (event) => {
    if (['A', 'BUTTON', 'LI', 'INPUT'].indexOf(event.target.nodeName) === -1) {
      return;
    }

    clickSound.currentTime = 0;
    clickSound.play();
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

  const readableElements = [
    'A',
    'BUTTON',
    'H1',
    'H2',
    'H3',
    'H4',
    'H5',
    'H6',
    'HEADER',
    'INPUT',
    'LI',
    'P',
    'TEXTAREA'
  ];
  const msg = new SpeechSynthesisUtterance();
  ['mouseover', 'touchdown'].forEach((event) => {
    document.addEventListener(event, function (event) {
      Settings.getValue('accessibility.narrator.enabled').then((value) => {
        if (!value) {
          return;
        }

        let ttsString = event.target.ariaLabel;
        if (readableElements.indexOf(event.target.nodeName) !== -1) {
          if (!ttsString) {
            if (event.target.value) {
              ttsString = event.target.value;
            } else {
              ttsString = event.target.textContent;
            }
          }
        }

        if (ttsString) {
          speechSynthesis.cancel();
          msg.text = ttsString;
          speechSynthesis.speak(msg);

          ipcRenderer.send('narrate', {
            message: ttsString
          });
        }
      });
    });
  });

  function convertToAbsoluteUrl(relativeUrl) {
    const baseUrl = window.location.origin;
    return new URL(relativeUrl, baseUrl).href;
  }

  async function getFileAsUint8Array(url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  }

  window.addEventListener('load', function () {
    const inputAreas = document.querySelectorAll(
      'input[type=text], input[type=name], input[type=email], input[type=password], input[type=number], textarea'
    );
    inputAreas.forEach(function (inputElement) {
      inputElement.addEventListener('focus', function () {
        ipcRenderer.send('message', {
          type: 'keyboard',
          action: 'show'
        });
      });

      inputElement.addEventListener('blur', function () {
        ipcRenderer.send('message', {
          type: 'keyboard',
          action: 'hide'
        });
      });
    });

    const mediaElements = document.querySelectorAll('audio, video');
    mediaElements.forEach((mediaElement) => {
      mediaElement.addEventListener('play', function (event) {
        console.log(event);
        const url = convertToAbsoluteUrl(mediaElement.src);
        getFileAsUint8Array(url).then((data) => {
          musicMetadata
            .parseBuffer(data, mime.getType(url))
            .then((metadata) => {
              const common = metadata.common;
              const picture = common.picture;
              ipcRenderer.send('mediaplay', {
                title: common.title,
                artist: common.artist,
                album: common.album,
                artwork: `data:${picture.format};base64,${picture.data.toString(
                  'base64'
                )}`,
                date: common.date
              });
            });
        });
      });
      mediaElement.addEventListener('pause', function (event) {
        console.log(event);
        ipcRenderer.send('mediapause', {});
      });

      // Picture-in-Picture
      if (
        location.host.includes('system.localhost') &&
        mediaElement.nodeName === 'VIDEO'
      ) {
        return;
      }

      const existingButton = mediaElement.parentElement.querySelector(
        '.openorchid-pip-button'
      );
      if (existingButton) {
        return;
      }

      const button = document.createElement('button');
      button.classList.add('openorchid-pip-button');
      button.style.left = `${
        mediaElement.getBoundingClientRect().left +
        mediaElement.getBoundingClientRect().width / 2 -
        100
      }px`;
      button.style.top = `${
        mediaElement.getBoundingClientRect().top +
        mediaElement.getBoundingClientRect().height / 2
      }px`;
      button.addEventListener('click', function () {
        button.classList.toggle('enabled');
        if (button.classList.contains('enabled')) {
          mediaElement.pause();
          ipcRenderer.send('message', {
            type: 'picture-in-picture',
            videoUrl: (
              mediaElement.src || mediaElement.querySelector('source').src
            ).startsWith('http')
              ? mediaElement.src || mediaElement.querySelector('source').src
              : location.origin +
                (mediaElement.src || mediaElement.querySelector('source').src),
            timestamp: mediaElement.currentTime,
            action: 'enable'
          });
        } else {
          ipcRenderer.send('message', {
            type: 'picture-in-picture',
            action: 'disable'
          });
        }
      });
      document.body.appendChild(button);
    });

    const handleAccentColor = (value) => {
      if (document.querySelector('.app')) {
        document.scrollingElement.style.setProperty(
          '--accent-color-r',
          value.r
        );
        document.scrollingElement.style.setProperty(
          '--accent-color-g',
          value.g
        );
        document.scrollingElement.style.setProperty(
          '--accent-color-b',
          value.b
        );
      }
    };
    Settings.getValue('homescreen.accent_color.rgb').then(handleAccentColor);
    Settings.addObserver('homescreen.accent_color.rgb', handleAccentColor);

    const handleSoftwareButtons = (value) => {
      if (document.querySelector('.app')) {
        if (value) {
          document
            .querySelector('.app')
            .style.setProperty('--software-buttons-height', '4rem');
        } else {
          document
            .querySelector('.app')
            .style.setProperty('--software-buttons-height', '2.5rem');
        }
      }
    };
    Settings.getValue('general.software_buttons.enabled').then(
      handleSoftwareButtons
    );
    Settings.addObserver(
      'general.software_buttons.enabled',
      handleSoftwareButtons
    );

    if ('mozL10n' in navigator) {
      Settings.getValue('general.lang.code').then((value) => {
        navigator.mozL10n.language.code = value;
      });
      Settings.addObserver('general.lang.code', (value) => {
        navigator.mozL10n.language.code = value;
      });
    }
  });

  document.addEventListener('DOMContentLoaded', function () {
    // Define a function to handle the mutation
    function handleMutation(mutations) {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.tagName !== 'WEBVIEW') {
            return;
          }
          // Set attributes for the newly added webview
          node.setAttribute('useragent', navigator.userAgent);
          node.setAttribute(
            'preload',
            `file://${__dirname.replaceAll('\\', '/')}/preload.js`
          );
          node.setAttribute('nodeintegration', true);
          node.setAttribute('nodeintegrationinsubframes', true);

          [
            'did-start-loading',
            'did-start-navigation',
            'did-stop-loading',
            'dom-ready'
          ].forEach((eventType) => {
            node.addEventListener(eventType, () => {
              try {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', 'openorchid://dom/html.css', true);
                xhr.onreadystatechange = function () {
                  if (xhr.readyState === 4 && xhr.status === 200) {
                    const cssContent = xhr.responseText;
                    node.insertCSS(cssContent);
                  } else if (xhr.readyState === 4) {
                    console.error(
                      'Failed to fetch CSS:',
                      xhr.status,
                      xhr.statusText
                    );
                  }
                };
                xhr.send();

                const xhr1 = new XMLHttpRequest();
                xhr1.open('GET', 'openorchid://dom/index.js', true);
                xhr1.onreadystatechange = function () {
                  if (xhr1.readyState === 4 && xhr1.status === 200) {
                    const jsContent = xhr1.responseText;
                    node.executeJavaScript(jsContent);
                  } else if (xhr1.readyState === 4) {
                    console.error(
                      'Failed to fetch JS:',
                      xhr1.status,
                      xhr1.statusText
                    );
                  }
                };
                xhr1.send();
              } catch (error) {
                console.error(error);
              }

              if (
                /^http:\/\/.*\.localhost:8081\//.test(node.getAttribute('src'))
              ) {
                node.setAttribute('nodeintegration', true);
                node.setAttribute('nodeintegrationinsubframes', true);
              } else {
                node.setAttribute('nodeintegration', false);
                node.setAttribute('nodeintegrationinsubframes', false);
              }
            });
          });
        });
      });
    }

    // Create a new instance of MutationObserver and set up the observer
    const observer = new MutationObserver(handleMutation);

    // Select the target node (body in this case)
    const targetNode = document.body;

    // Options for the observer (we're interested in childList mutations)
    const config = { childList: true, subtree: true };

    // Start observing the target node with the specified options
    observer.observe(targetNode, config);
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
    if (
      event.target.nodeName !== 'WEBVIEW' &&
      event.target.getAttribute('title')
    ) {
      ipcRenderer.send('message', {
        type: 'title',
        action: 'show',
        originType: location.origin.includes(
          `system.localhost:${location.port}`
        )
          ? 'system'
          : 'webapp',
        position: {
          left: event.clientX,
          top: event.clientY
        },
        title: event.target.getAttribute('title')
      });
      console.log(event.target.getAttribute('title'));
    }
  });

  document.addEventListener('mouseleave', () => {
    ipcRenderer.send('message', {
      type: 'title',
      action: 'hide'
    });
  });
})(window);
