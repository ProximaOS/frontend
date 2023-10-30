const Settings = require('../../src/settings');

!(function (exports) {
  'use strict';

  const { ipcRenderer } = require('electron');

  const Narrator = {
    message: null,
    readableElements: ['A', 'BUTTON', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HEADER', 'INPUT', 'LI', 'P', 'TEXTAREA'],
    triggerEvents: ['mouseover', 'touchdown'],

    settings: ['accessibility.narrator.enabled'],
    SETTINGS_ACCESSIBILITY_NARRATOR: 0,

    init: function () {
      this.message = new SpeechSynthesisUtterance();
      this.triggerEvents.forEach((event) => {
        document.addEventListener(event, this.handleNarration.bind(this));
      });
    },

    handleNarration: function (event) {
      Settings.getValue(this.SETTINGS_ACCESSIBILITY_NARRATOR).then((value) => {
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
    }
  };

  Narrator.init();
})(window);
