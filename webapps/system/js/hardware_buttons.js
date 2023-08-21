!(function (exports) {
  'use strict';

  const { ipcRenderer } = require('electron');

  const HardwareButtons = {
    screen: document.getElementById('screen'),

    init: function () {
      ipcRenderer.on('powerend', this.handlePowerEnd.bind(this));
      ipcRenderer.on('volumeup', this.handleVolumeUp.bind(this));
      ipcRenderer.on('volumedown', this.handleVolumeDown.bind(this));
      ipcRenderer.on('shortcut', this.handleShortcut.bind(this));
    },

    handlePowerEnd: function () {
      LockscreenMotion.showMotionElement();
      LockscreenMotion.resetMotionElement();
      LockscreenMotion.isDragging = false;

      screen.classList.toggle('poweroff');
    },

    handleVolumeUp: function () {
      VolumeRocker.volumeUp();
    },

    handleVolumeDown: function () {
      VolumeRocker.volumeDown();
    },

    handleShortcut: function () {
      AppWindow.create('http://browser.localhost:8081/manifest.json', {});
    }
  };

  HardwareButtons.init();
})(window);
