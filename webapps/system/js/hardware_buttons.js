!(function (exports) {
  'use strict';

  const HardwareButtons = {
    screen: document.getElementById('screen'),

    powerTimer: null,
    isPowerHeld: false,
    isPowerLongHeld: false,
    isPowerScreenVisible: false,

    POWER_HOLD_DURATION: 1000,
    POWER_RESET_DURATION: 5000,

    init: function () {
      window.addEventListener('powerstart', this.handlePowerStart.bind(this));
      window.addEventListener('powerend', this.handlePowerEnd.bind(this));
      window.addEventListener('volumeup', this.handleVolumeUp.bind(this));
      window.addEventListener('volumedown', this.handleVolumeDown.bind(this));
      window.addEventListener('shortcut', this.handleShortcut.bind(this));
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
            IPC.send('restart', {});
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
      const appWindow = new AppWindow('http://browser.localhost:8081/manifest.json', {});
      Snackbar.notify(L10n.get('shortcuts-holdForSOS'));
    }
  };

  HardwareButtons.init();
})(window);
