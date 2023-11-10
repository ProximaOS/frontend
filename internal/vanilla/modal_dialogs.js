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
      let confirmationValue = null;
      let confirmationReceived = false;
      let codeExecuted = false;

      ipcRenderer.send('message', {
        type: 'confirm',
        title: document.title,
        href: location.href,
        origin: location.origin,
        text: message
      });

      while (!confirmationReceived) {
        if (!codeExecuted) {
          ipcRenderer.once('message', (data) => {
            if (data.type === 'confirm-reply') {
              confirmationValue = data.value;
              confirmationReceived = true;
            }
          });

          codeExecuted = true; // Set the flag to true so it doesn't run again
        }
      }

      return confirmationValue;
    },

    prompt: function (message, value) {
      let promptValue = null;
      let promptReceived = false;
      let codeExecuted = false;

      ipcRenderer.send('message', {
        type: 'prompt',
        title: document.title,
        href: location.href,
        origin: location.origin,
        text: message,
        input: value
      });

      while (!promptReceived) {
        if (!codeExecuted) {
          ipcRenderer.once('message', (data) => {
            if (data.type === 'prompt-reply') {
              promptValue = data.value;
              promptReceived = true;
            }
          });

          codeExecuted = true; // Set the flag to true so it doesn't run again
        }
      }

      return promptValue;
    }
  };

  module.exports = ModalDialogs;
})();
