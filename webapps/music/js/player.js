!(function (exports) {
  'use strict';

  const Player = {
    element: document.getElementById('player'),
    trackSlider: document.getElementById('player-track-slider'),
    trackCurrentTime: document.getElementById('player-track-current-time'),
    trackDuration: document.getElementById('player-track-duration'),

    audioElement: new Audio(),

    init: function () {
      this.audioElement.addEventListener('progress', this.onProgress.bind(this));
      this.audioElement.addEventListener('play', this.onPlay.bind(this));
      this.audioElement.addEventListener('pause', this.onPause.bind(this));
    },

    show: function () {
      this.element.classList.add('visible');
    },

    play: function (base64) {
      this.show();

      this.audioElement.pause();
      this.audioElement = new Audio(base64);
      this.audioElement.play();
    },

    hide: function () {
      this.element.classList.remove('visible');
    },

    onProgress: function (event) {
      this.trackSlider.min = 0;
      this.trackSlider.max = this.audioElement.duration;
      this.trackSlider.value = this.audioElement.currentTime;
    },

    onPlay: function (event) {

    },

    onPause: function (event) {

    }
  };

  Player.init();

  exports.Player = Player;
})(window);
