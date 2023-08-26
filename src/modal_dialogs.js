!(function (exports) {
  'use strict';

  const { ipcRenderer } = require('electron');

  module.exports = {
    alert: function (text) {
      ipcRenderer.send('message', {
        type: 'alert',
        title: document.title,
        origin: location.origin,
        text
      });
    },

    confirm: function (text) {
      ipcRenderer.send('message', {
        type: 'confirm',
        title: document.title,
        origin: location.origin,
        text
      });

      return true;
    },

    prompt: function (text, input) {
      ipcRenderer.send('message', {
        type: 'prompt',
        title: document.title,
        origin: location.origin,
        text,
        input
      });

      return '';
    }
  };
})(window);
