!(function () {
  'use strict';

  const { ipcRenderer } = require('electron');
  const api = require('./service_api');
  const NotificationAPI = require('./notification');
  const ModalDialogs = require('./modal_dialogs');

  window.open = function (url, options) {
    const optionsList = options.split(',');
    let formattedUrl;
    if (!url.startsWith('http:') || !url.startsWith('https:')) {
      if (url.startsWith('/')) {
        formattedUrl = location.origin + url;
      } else {
        formattedUrl = `${location.origin}/${url}`;
      }
    } else {
      formattedUrl = url;
    }

    ipcRenderer.send('message', {
      type: 'window',
      action: 'open',
      url: formattedUrl,
      options: optionsList
    });
  };

  window.close = function () {
    ipcRenderer.sendToHost('close', {});
  };

  window.alert = ModalDialogs.alert;
  window.confirm = ModalDialogs.confirm;
  window.prompt = ModalDialogs.prompt;

  window.Notification = NotificationAPI;

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

    const video = document.querySelectorAll('video');
    video.forEach(function (videoElement) {
      if (location.host.includes('system.localhost')) {
        return;
      }

      const existingButton = videoElement.parentElement.querySelector(
        '.openorchid-pip-button'
      );
      if (existingButton) {
        return;
      }

      const button = document.createElement('button');
      button.classList.add('openorchid-pip-button');
      button.style.left = `${
        videoElement.getBoundingClientRect().left +
        videoElement.getBoundingClientRect().width / 2 -
        100
      }px`;
      button.style.top = `${
        videoElement.getBoundingClientRect().top +
        videoElement.getBoundingClientRect().height / 2
      }px`;
      button.addEventListener('click', function () {
        button.classList.toggle('enabled');
        if (button.classList.contains('enabled')) {
          videoElement.pause();
          ipcRenderer.send('message', {
            type: 'picture-in-picture',
            videoUrl: (
              videoElement.src || videoElement.querySelector('source').src
            ).startsWith('http')
              ? videoElement.src || videoElement.querySelector('source').src
              : location.origin +
                (videoElement.src || videoElement.querySelector('source').src),
            timestamp: videoElement.currentTime,
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

    if ('_session' in window) {
      _session.settings
        .getValue('homescreen.accent_color.rgb')
        .then((value) => {
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
        });

      _session.settings
        .getValue('general.software_buttons.enabled')
        .then((value) => {
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
        });

      if ('mozL10n' in navigator) {
        _session.settings.getValue('general.lang.code').then((value) => {
          navigator.mozL10n.language.code = value;
        });
      }
    }
  });

  document.addEventListener('scroll', function () {
    ipcRenderer.sendToHost('scroll', {
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

  if (!process && navigator.userAgent.includes('OpenOrchid')) {
    const pattern = /^http:\/\/.*\.localhost:8081\//;
    if (!pattern.test(location.href)) {
      return;
    }
  }

  window._session = api;
  if (location.host.includes('system.localhost')) {
    window._session.isWebview = false;
  } else {
    window._session.isWebview = true;
  }
})();
