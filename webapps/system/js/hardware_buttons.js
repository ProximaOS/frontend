!(function (exports) {
  'use strict';

  const { ipcRenderer } = require('electron');

  const HardwareButtons = {
    screen: document.getElementById('screen'),

    powerTimer: null,
    isPowerHeld: false,
    isPowerLongHeld: false,
    isPowerScreenVisible: false,

    POWER_HOLD_DURATION: 1000,
    POWER_RESET_DURATION: 5000,

    init: function () {
      ipcRenderer.on('powerstart', this.handlePowerStart.bind(this));
      ipcRenderer.on('powerend', this.handlePowerEnd.bind(this));
      ipcRenderer.on('volumeup', this.handleVolumeUp.bind(this));
      ipcRenderer.on('volumedown', this.handleVolumeDown.bind(this));
      ipcRenderer.on('shortcut', this.handleShortcut.bind(this));
    },

    handlePowerStart: function () {
      this.isPowerHeld = true;
      this.isPowerLongHeld = true;
      this.powerTimer = setTimeout(() => {
        if (this.isPowerHeld) {
          PowerScreen.toggle();
          this.isPowerScreenVisible = true;
        } else {
          LockscreenMotion.showMotionElement();
          LockscreenMotion.resetMotionElement();
          LockscreenMotion.isDragging = false;

          this.screen.classList.toggle('poweroff');
        }

        this.powerTimer = setTimeout(() => {
          if (this.isPowerLongHeld) {
            ipcRenderer.send('restart', {});
          }
        }, this.POWER_RESET_DURATION);
      }, this.POWER_HOLD_DURATION);
    },

    handlePowerEnd: function () {
      this.isPowerHeld = false;
      this.isPowerLongHeld = false;
      if (!this.isPowerScreenVisible) {
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
