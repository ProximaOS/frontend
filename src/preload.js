!(function (exports) {
  'use strict';

  const { ipcRenderer } = require('electron');
  const settings = require('./openorchid-settings');

  require('./node_plugins');

  // contextBridge.exposeInIsolatedWorld('open', require('./web/open'));
  // contextBridge.exposeInIsolatedWorld('Notification', require('./web/notification'));
  // contextBridge.exposeInIsolatedWorld('alert', require('./web/modal_dialogs').alert);
  // contextBridge.exposeInIsolatedWorld('confirm', require('./web/modal_dialogs').confirm);
  // contextBridge.exposeInIsolatedWorld('prompt', require('./web/modal_dialogs').prompt);

  const clickSound = new Audio(
    `http://shared.localhost:${location.port}/resources/sounds/click.wav`
  );

  document.addEventListener('focus', (event) => {
    if (['A', 'BUTTON', 'LI', 'INPUT'].indexOf(event.target.nodeName) === -1) {
      return;
    }

    clickSound.currentTime = 0;
    clickSound.play();
  });

  document.addEventListener('DOMContentLoaded', function () {
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

    settings.getValue('homescreen.accent_color.rgb').then((value) => {
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

    settings.getValue('general.software_buttons.enabled').then((value) => {
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
      settings.getValue('general.lang.code').then((value) => {
        navigator.mozL10n.language.code = value;
      });
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
})(window);
