!(function (exports) {
  'use strict';

  const PowerScreen = {
    overlay: document.getElementById('power-screen'),
    shutdownButton: document.getElementById('power-screen-shutdown-button'),
    restartButton: document.getElementById('power-screen-restart-button'),

    isVisible: false,

    shutdownSound: new Audio('/resources/sounds/shutdown.wav'),

    init: function () {
      this.shutdownButton.addEventListener('click', this.handleShutdownButton.bind(this));
      this.restartButton.addEventListener('click', this.handleRestartButton.bind(this));
    },

    show: function () {
      this.isVisible = true;
      this.overlay.classList.add('visible');
    },

    hide: function () {
      this.isVisible = false;
      this.overlay.classList.remove('visible');
    },

    toggle: function () {
      this.isVisible = !this.isVisible;
      this.overlay.classList.toggle('visible', this.isVisible);
    },

    handleShutdownButton: function () {
      LoadingScreen.show();
      this.shutdownSound.play();
      setTimeout(() => {
        IPC.send('shutdown', {});
      }, 2000);
    },

    handleRestartButton: function () {
      LoadingScreen.show();
      this.shutdownSound.play();
      setTimeout(() => {
        IPC.send('restart', {});
      }, 2000);
    }
  };

  PowerScreen.init();

  exports.PowerScreen = PowerScreen;
})(window);
