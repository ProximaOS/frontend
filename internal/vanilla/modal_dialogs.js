!(function () {
  'use strict';

  const { ipcRenderer } = require('electron');

  const ModalDialogs = {
    alert: function (message) {
      ipcRenderer.send('message', {
        type: 'alert',
        title: document.title,
        href: location.href,
        origin: location.origin,
        text: message
      });
    },
    confirm: function (message) {
      ipcRenderer.send('message', {
        type: 'confirm',
        title: document.title,
        href: location.href,
        origin: location.origin,
        text: message
      });
    },
    prompt: function (message, value) {
      ipcRenderer.send('message', {
        type: 'prompt',
        title: document.title,
        href: location.href,
        origin: location.origin,
        text: message,
        input: value
      });
    }
  };

  exports.ModalDialogs = ModalDialogs;
})();
