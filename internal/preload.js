!(function (exports) {
  'use strict';

  const { ipcRenderer, contextBridge } = require('electron');
  const musicMetadata = require('music-metadata-browser');
  const mime = require('mime');
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
    require('./vanilla/notifications')
  );
  contextBridge.exposeInMainWorld(
    '_alert',
    require('./vanilla/modal_dialogs').alert
  );
  contextBridge.exposeInMainWorld(
    '_confirm',
    require('./vanilla/modal_dialogs').confirm
  );
  contextBridge.exposeInMainWorld(
    '_prompt',
    require('./vanilla/modal_dialogs').prompt
  );

  function playStereoAudio(audioFilePath, xPosition) {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const stereoPanner = audioContext.createStereoPanner();

    const audioElement = new Audio();
    audioElement.crossOrigin = 'anonymous'; // Set crossOrigin attribute

    audioElement.addEventListener('canplaythrough', () => {
      const source = audioContext.createMediaElementSource(audioElement);

      // Set the pan value based on the x position
      const panValue = (xPosition / window.innerWidth) * 2 - 1; // -1 to 1 range
      stereoPanner.pan.value = panValue;

      source.connect(stereoPanner);
      stereoPanner.connect(audioContext.destination);

      audioElement.play();
    });

    audioElement.src = audioFilePath;
  }

  document.addEventListener('click', (event) => {
    if (['A', 'BUTTON', 'LI', 'INPUT'].indexOf(event.target.nodeName) === -1) {
      return;
    }

    playStereoAudio(
      `http://shared.localhost:${location.port}/resources/sounds/click.wav`,
      event.clientX
    );
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
          action: 'show',
          origin: location.href
        });
      });
    });

    document.addEventListener('click', function (event) {
      if (['INPUT', 'TEXTAREA'].indexOf(event.target.nodeName) === -1) {
        ipcRenderer.send('message', {
          type: 'keyboard',
          action: 'hide',
          origin: location.href
        });
      }
    });

    const mediaElements = document.querySelectorAll('audio, video');
    mediaElements.forEach((mediaElement) => {
      mediaElement.addEventListener('play', function (event) {
        console.log(mediaElement.src, event);
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

    function ColorPicker(url, options = {}) {
      return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const colors = [];

        useCanvas(canvas, url)
          .then(() => {
            const downsamplingFactor = options.downsampling || 1;
            const imageData = canvas
              .getContext('2d')
              .getImageData(
                0,
                0,
                Math.floor(canvas.width / downsamplingFactor),
                Math.floor(canvas.height / downsamplingFactor)
              ).data;

            for (let i = 0; i < imageData.length; i += 4) {
              const brightness = options.brightness || 1;
              const r =
                imageData[i] +
                parseInt((255 - imageData[i]) * (brightness - 1));
              const g =
                imageData[i + 1] +
                parseInt((255 - imageData[i + 1]) * (brightness - 1));
              const b =
                imageData[i + 2] +
                parseInt((255 - imageData[i + 2]) * (brightness - 1));

              colors.push({ r, g, b });
            }

            if (options.linearGradient !== undefined) {
              resolve(
                'linear-gradient(' +
                  options.linearGradient +
                  ', ' +
                  colors.join(', ') +
                  ')'
              );
            } else {
              resolve(colors);
            }
          })
          .catch(reject);
      });

      function useCanvas(element, imageUrl) {
        return new Promise((resolve, reject) => {
          const image = new Image();
          image.crossOrigin = 'anonymous';
          image.src = imageUrl;

          image.onload = () => {
            element.width = image.width;
            element.height = image.height;

            element
              .getContext('2d')
              .drawImage(image, 0, 0, image.width, image.height);

            resolve();
          };

          image.onerror = reject;
        });
      }
    }

    const handleWallpaperAccent = (value) => {
      ColorPicker(value, { colors: 3, brightness: 1 }).then((color) => {
        // Convert the color to RGB values
        let r = color[1].r;
        let g = color[1].g;
        let b = color[1].b;

        // Calculate relative luminance
        const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

        // Store original values
        const originalR = r;
        const originalG = g;
        const originalB = b;

        if (luminance < 0.3 && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          // Brighten the color
          r = Math.round((r + 128) / 2);
          g = Math.round((g + 128) / 2);
          b = Math.round((b + 128) / 2);

          // Ensure color values are within the valid range (0 - 255)
          r = Math.max(0, Math.min(255, r));
          g = Math.max(0, Math.min(255, g));
          b = Math.max(0, Math.min(255, b));
        }

        // Check if the resulting color is too bright, and if so, darken it
        if (luminance > 0.8 && window.matchMedia('(prefers-color-scheme: light)').matches) {
          const maxColorValue = Math.max(r, g, b);
          if (maxColorValue > 200) {
            r = Math.round(originalR * 0.8);
            g = Math.round(originalG * 0.8);
            b = Math.round(originalB * 0.8);
          }
        }

        document.scrollingElement.style.setProperty('--accent-color-r', r);
        document.scrollingElement.style.setProperty('--accent-color-g', g);
        document.scrollingElement.style.setProperty('--accent-color-b', b);

        // Calculate relative luminance
        const accentLuminance = (0.2126 * originalR + 0.7152 * originalG + 0.0722 * originalB) / 255;

        if (accentLuminance > 0.5) {
          document.scrollingElement.style.setProperty(
            '--accent-color-plus',
            'rgba(0,0,0,0.75)'
          );
        } else {
          document.scrollingElement.style.setProperty(
            '--accent-color-plus',
            'rgba(255,255,255,0.75)'
          );
        }
      });
    };
    Settings.getValue('video.wallpaper.url').then(handleWallpaperAccent);
    Settings.addObserver('video.wallpaper.url', handleWallpaperAccent);

    const handleAccentColor = (value) => {
      if (value && document.querySelector('[role="app"]')) {
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

      // Convert the color to RGB values
      const r = parseInt(value.r, 16);
      const g = parseInt(value.g, 16);
      const b = parseInt(value.b, 16);

      // Calculate relative luminance
      const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

      if (luminance > 0.5) {
        document.scrollingElement.style.setProperty(
          '--accent-color-plus',
          'rgba(0,0,0,0.75)'
        );
      } else {
        document.scrollingElement.style.setProperty(
          '--accent-color-plus',
          'rgba(255,255,255,0.75)'
        );
      }
    };
    Settings.getValue('homescreen.accent_color.rgb').then(handleAccentColor);
    Settings.addObserver('homescreen.accent_color.rgb', handleAccentColor);

    const handleSoftwareButtons = (value) => {
      if (document.querySelector('[role="app"]')) {
        if (navigator.userAgent.includes('Desktop') || value) {
          document
            .querySelector('[role="app"]')
            .style.setProperty('--software-buttons-height', '4rem');
        } else {
          if (location.origin.includes('homescreen.localhost:8081')) {
            document
              .querySelector('[role="app"]')
              .style.setProperty('--software-buttons-height', '1rem');
          } else {
            document
              .querySelector('[role="app"]')
              .style.setProperty('--software-buttons-height', '2.5rem');
          }
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

    setTimeout(() => {
      Settings.getValue('general.lang.code').then((value) => {
        if ('mozL10n' in navigator) {
          navigator.mozL10n.language.code = value;
        }
      });
      Settings.addObserver('general.lang.code', (value) => {
        if ('mozL10n' in navigator) {
          navigator.mozL10n.language.code = value;
        }
      });
    }, 500);
  });

  document.addEventListener('DOMContentLoaded', function () {
    // Define a function to handle the mutation
    function handleMutation(mutations) {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.tagName === 'WEBVIEW') {
            // Set attributes for the newly added webview
            node.preload = `file://${__dirname.replaceAll(
              '\\',
              '/'
            )}/preload.js`;
          }
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
    } else {
      ipcRenderer.send('message', {
        type: 'title',
        action: 'hide'
      });
    }
  });
})(window);
