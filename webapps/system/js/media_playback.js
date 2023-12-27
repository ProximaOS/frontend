!(function (exports) {
  'use strict';

  const MediaPlayback = {
    element: document.getElementById('media-playback'),
    title: document.getElementById('media-playback-title'),
    artist: document.getElementById('media-playback-artist'),
    playPauseButton: document.getElementById('media-playback-playpause'),
    previousButton: document.getElementById('media-playback-previous'),
    nextButton: document.getElementById('media-playback-next'),
    
    iconElement: document.getElementById('statusbar-playing'),

    init: function () {
      window.addEventListener('mediaplay', this.handleMediaPlay.bind(this));
      window.addEventListener('mediapause', this.handleMediaPause.bind(this));
    },

    handleMediaPlay: function (event) {
      this.title.textContent = event.detail.title;
      this.artist.textContent = event.detail.artist;

      this.iconElement.classList.remove('hidden');
      this.playPauseButton.dataset.icon = 'pause-alt';
    },

    handleMediaPause: function (event) {
      this.iconElement.classList.add('hidden');
      this.playPauseButton.dataset.icon = 'play-alt';
    }
  };

  MediaPlayback.init();
})(window);
