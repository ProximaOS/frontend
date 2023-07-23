const { ipcRenderer } = require('electron');
const { v4 } = require('uuid');

module.exports = {
  alert: function (text) {
    ipcRenderer.send('message', {
      type: "alert",
      origin: this.origin,
      text: text
    });
  },

  confirm: function (text) {
    ipcRenderer.send('message', {
      type: "confirm",
      origin: this.origin,
      text: text
    });

    return true;
  },

  prompt: function (text, input) {
    ipcRenderer.send('message', {
      type: "prompt",
      origin: this.origin,
      text: text,
      input: input
    });

    return '';
  }
};
