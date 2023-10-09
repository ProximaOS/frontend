!(function (exports) {
  'use strict';

  const Splashscreen = {
    splashElement: document.getElementById('splashscreen'),
    videoElement: document.getElementById('splashscreen-video'),

    bootAnimationFile: '/resources/videos/splashscreen.mp4',
    bootSound: new Audio('/resources/sounds/startup.wav'),

    isBooting: true,

    init: function () {
      this.videoElement.src = this.bootAnimationFile;
      this.videoElement.play();

      this.bootSound.play();
      this.bootSound.ontimeupdate = () => {
        if (this.isBooting && this.bootSound.currentTime >= 1.65) {
          this.bootSound.playbackRate = this.bootSound.playbackRate * 0.02;
        }
      };
    },

    hide: function () {
      this.splashElement.classList.add('hidden');

      this.audioTimer = setTimeout(() => {
        this.isBooting = false;
        this.bootSound.playbackRate = 1;
      }, 2000);
    }
  };

  Splashscreen.init();

  exports.Splashscreen = Splashscreen;
})(window);
