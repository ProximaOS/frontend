!(function (exports) {
  'use strict';

  const { ipcRenderer } = require('electron');

  const HardwareButtons = {
    screen: document.getElementById('screen'),

    powerTimer: null,
    startTime: null,
    currentTime: null,

    init: function () {
      ipcRenderer.on('powerstart', this.handlePowerStart.bind(this));
      ipcRenderer.on('powerend', this.handlePowerEnd.bind(this));
      ipcRenderer.on('volumeup', this.handleVolumeUp.bind(this));
      ipcRenderer.on('volumedown', this.handleVolumeDown.bind(this));
      ipcRenderer.on('shortcut', this.handleShortcut.bind(this));
    },

    handlePowerStart: function () {
      this.startTime = new Date().getTime();
      this.powerTimer = 0;
    },

    handlePowerEnd: function () {
      this.currentTime = new Date().getTime();
      const timeElapsed = (this.currentTime - this.startTime);
      console.log(this.startTime, this.currentTime, timeElapsed);

      if (timeElapsed >= 2000) {
        PowerScreen.toggle();
      } else {
        LockscreenMotion.showMotionElement();
        LockscreenMotion.resetMotionElement();
        LockscreenMotion.isDragging = false;

        this.screen.classList.toggle('poweroff');
      }
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
