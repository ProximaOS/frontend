!(function (exports) {
  'use strict';

  const { ipcRenderer } = require('electron');

  const Keybinds = {
    init: function () {
      document.addEventListener('keyup', this.handleKeybind.bind(this));
    },

    handleKeybind: function (event) {
      ipcRenderer.sendToHost('keybind', {
        isCtrlKey: event?.isCtrlKey,
        isShiftKey: event?.isShiftKey,
        isAltKey: event?.isAltKey,
        keyCode: event?.key
      });
    }
  };

  Keybinds.init();
})(window);
