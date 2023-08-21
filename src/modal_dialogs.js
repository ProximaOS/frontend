!(function (exports) {

'use strict';

const { ipcRenderer } = require('electron');

module.exports = {
  alert: function (text) {
    ipcRenderer.send('message', {
      type: "alert",
      origin: location.origin,
      text: text
    });
  },

  confirm: function (text) {
    ipcRenderer.send('message', {
      type: "confirm",
      origin: location.origin,
      text: text
    });

    return true;
  },

  prompt: function (text, input) {
    ipcRenderer.send('message', {
      type: "prompt",
      origin: location.origin,
      text: text,
      input: input
    });

    return '';
  }
};

})(window);
