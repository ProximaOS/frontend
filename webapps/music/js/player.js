!(function (exports) {
  'use strict';

  const Player = {
    element: document.getElementById('player'),
    backButton: document.getElementById('player-back-button'),
    name: document.getElementById('player-name'),
    trackSlider: document.getElementById('player-track-slider'),
    trackCurrentTime: document.getElementById('player-track-current-time'),
    trackDuration: document.getElementById('player-track-duration'),

    playPauseButton: document.getElementById('player-playpause-button'),

    audioElement: new Audio(),

    init: function () {
      this.backButton.addEventListener('click', this.handleBackButton.bind(this));
      this.trackSlider.addEventListener('input', this.handleTrackSlider.bind(this));
      this.trackSlider.addEventListener('change', this.handleTrackSlider.bind(this));
    },

    show: function () {
      this.element.classList.add('visible');
    },

    play: function (dataUrl, { title, artist, album, artwork, date }) {
      this.show();

      IPC.send('mediaplay', { title, artist, album, artwork, date });
      this.name.textContent = title;

      this.audioElement.pause();
      this.audioElement = new Audio(dataUrl);
      this.audioElement.addEventListener('timeupdate', this.onProgress.bind(this));
      this.audioElement.addEventListener('play', this.onPlay.bind(this));
      this.audioElement.addEventListener('pause', this.onPause.bind(this));
      this.audioElement.play();
    },

    hide: function () {
      this.element.classList.remove('visible');
    },

    handleTrackSlider: function (event) {
      this.audioElement.currentTime = this.trackSlider.currentTime;
    },

    convertSeconds: function (seconds) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;

      if (hours > 0) {
        return `${Math.round(hours).toString().padStart(2, '0')}:${Math.round(minutes).toString().padStart(2, '0')}:${Math.round(remainingSeconds).toString().padStart(2, '0')}`;
      } else {
        return `${Math.round(minutes).toString().padStart(2, '0')}:${Math.round(remainingSeconds).toString().padStart(2, '0')}`;
      }
    },

    onProgress: function (event) {
      this.trackSlider.min = 0;
      this.trackSlider.max = this.audioElement.duration;
      this.trackSlider.value = this.audioElement.currentTime;

      this.trackDuration.textContent = this.convertSeconds(this.audioElement.duration);
      this.trackCurrentTime.textContent = this.convertSeconds(this.audioElement.currentTime);
    },

    onPlay: function (event) {
      this.playPauseButton.dataset.icon = 'pause-alt';
    },

    onPause: function (event) {
      this.playPauseButton.dataset.icon = 'play-alt';
    },

    handleBackButton: function (event) {
      this.hide();
    }
  };

  Player.init();

  exports.Player = Player;
})(window);
