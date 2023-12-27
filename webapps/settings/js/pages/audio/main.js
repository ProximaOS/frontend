!(function (exports) {
  'use strict';

  const Audio = {
    musicSlider: document.getElementById('audio-music-slider'),

    init: function () {
      this.musicSlider.min = 0;
      this.musicSlider.max = 100;
      this.musicSlider.addEventListener('input', this.handleMusicSlider.bind(this));
      window.Settings.getValue('audio.volume.music').then((data) => {
        this.musicSlider.value = data;
      });
    },

    handleMusicSlider: function () {
      const value = parseInt(this.musicSlider.value);
      window.Settings.setValue('audio.volume.music', value);
    }
  };

  Audio.init();
})(window);
