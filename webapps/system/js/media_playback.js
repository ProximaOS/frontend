!(function (exports) {
  'use strict';

  const MediaPlayback = {
    element: document.getElementById('media-playback'),
    title: document.getElementById('media-playback-title'),
    author: document.getElementById('media-playback-author'),
    playPauseButton: document.getElementById('media-playback-playpause'),
    previousButton: document.getElementById('media-playback-previous'),
    nextButton: document.getElementById('media-playback-next'),

    init: function () {
      window.addEventListener('mediaplay', this.handleMediaPlay.bind(this));
      window.addEventListener('mediapause', this.handleMediaPause.bind(this));
    },

    handleMediaPlay: function (event) {

    },

    handleMediaPause: function (event) {
    }
  };

  MediaPlayback.init();
})(window);
