!(function (exports) {
  'use strict';

  const MusicController = {
    audio: null,

    volume: 0.5,

    init: function () {
      this.audio = new Audio();
    },

    play: function (src, loop = false) {
      this.audio = new Audio();
      this.audio.src = src;
      this.audio.loop = loop;
      this.audio.play();
    },

    fadeInCurrentMusic: function (duration = 1) {
      this.audio.volume = this.volume;
    },

    fadeOutCurrentMusic: function (duration = 1) {
      this.audio.volume = 0;
    },

    stopCurrentMusic: function () {
      this.audio.pause();
      this.audio.src = null;
    },

    pauseCurrentMusic: function () {
      this.audio.pause();
    },

    setVolume: function (volume, duration = 1) {
      this.volume = volume;
      this.audio.volume = this.volume;
    }
  };

  MusicController.init();

  exports.MusicController = MusicController;
})(window);
