!(function (exports) {
  'use strict';

  const VolumeRocker = {
    element: document.getElementById('volume-rocker'),
    progressElement: document.getElementById('volume-rocker-progress'),

    TIMEOUT_DURATION: 2000,
    SHIFT_AMOUNT: 10,

    volume: 60,
    timer: null,

    show: function () {
      this.element.classList.add('visible');

      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.element.classList.remove('visible');
      }, this.TIMEOUT_DURATION);
    },

    hide: function () {
      clearTimeout(this.timer);
      this.element.classList.remove('visible');
    },

    checkVolume: function () {
      if (this.volume < 0) {
        this.volume = 0;
      }
      if (this.volume > 100) {
        this.volume = 100;
      }
    },

    updateProgress: function () {
      this.progressElement.style.setProperty('--progress', this.volume / 100);
    },

    volumeUp: function () {
      this.show();
      this.volume += this.SHIFT_AMOUNT;
      this.checkVolume();
      this.updateProgress();
    },

    volumeDown: function () {
      this.show();
      this.volume -= this.SHIFT_AMOUNT;
      this.checkVolume();
      this.updateProgress();
    }
  };

  exports.VolumeRocker = VolumeRocker;
})(window);
