!(function (exports) {
  'use strict';

  const Splashscreen = {
    splashElement: document.getElementById('splashscreen'),
    videoElement: document.getElementById('splashscreen-video'),
    videoSource: document.getElementById('splashscreen-video-source'),

    VIDEO_BOOT_START: '/resources/videos/splashscreen.mp4',
    VIDEO_BOOT_LOADING: '/resources/videos/splashscreen_loop.mp4',
    SOUND_BOOT_UP: new Audio('/resources/sounds/startup.wav'),

    isBooting: true,
    isFirstTime: false,
    audioTimeoutID: null,

    init: function () {
      if (this.videoElement) {
        this.videoElement.src = this.VIDEO_BOOT_START;

        this.videoElement.onended = () => {
          this.videoElement.src = this.VIDEO_BOOT_LOADING;
          this.videoElement.load();
          setTimeout(() => {
            this.videoElement.play();
            this.videoElement.loop = true;
          }, 1000);
        };
      }

      this.splashElement.classList.add('safety-warning');
      setTimeout(() => {
        this.splashElement.classList.remove('safety-warning');

        setTimeout(() => {
          this.SOUND_BOOT_UP.play();
          this.SOUND_BOOT_UP.ontimeupdate = () => {
            if (this.isBooting && this.SOUND_BOOT_UP.currentTime >= 1.65) {
              this.SOUND_BOOT_UP.playbackRate = this.SOUND_BOOT_UP.playbackRate * 0.2;
            }
          };

          if (this.videoElement) {
            this.videoElement.play();
          }
        }, 300);
      }, 3000);
    },

    hide: function () {
      this.videoElement.pause();

      if (this.isFirstTime) {
        this.splashElement.classList.add('reveal');
        this.splashElement.addEventListener('transitionend', () => {
          this.splashElement.classList.remove('reveal');
          this.splashElement.classList.add('hidden');
        });
      } else {
        this.splashElement.classList.add('hidden');
      }

      this.audioTimeoutID = setTimeout(() => {
        this.isBooting = false;
        this.SOUND_BOOT_UP.playbackRate = 1;
      }, 2000);
    }
  };

  document.addEventListener('DOMContentLoaded', () => Splashscreen.init());

  exports.Splashscreen = Splashscreen;
})(window);
