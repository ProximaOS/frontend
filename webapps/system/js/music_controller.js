!(function (exports) {
  'use strict';

  const MusicController = {
    context: new (window.AudioContext || window.webkitAudioContext)(),
    gainNode: null,
    currentSource: null,

    fadeDuration: 1,
    currentGain: 1,
    muffleFadeDuration: 2,
    muffleFrequency: 500,

    init: function () {
      this.gainNode = this.context.createGain();
      this.gainNode.connect(this.context.destination);
    },

    play: function (src, loop = false) {
      if (this.currentSource) {
        this.fadeOutCurrentMusic(this.fadeDuration);
      }

      const audio = new Audio();
      audio.src = src;
      audio.loop = loop;
      const source = this.context.createMediaElementSource(audio);
      source.connect(this.gainNode);

      audio.addEventListener('canplaythrough', () => {
        this.currentSource = source;
        audio.volume = this.currentGain;
        audio.play();
        this.fadeInCurrentMusic(this.fadeDuration);
      });
    },

    fadeInCurrentMusic: function (duration = 1) {
      const gain = this.gainNode.gain;
      gain.setValueAtTime(0, this.context.currentTime);
      gain.linearRampToValueAtTime(this.currentGain, this.context.currentTime + duration);
    },

    fadeOutCurrentMusic: function (duration = 1) {
      const gain = this.gainNode.gain;
      gain.setValueAtTime(this.currentGain, this.context.currentTime);
      gain.linearRampToValueAtTime(0, this.context.currentTime + duration);
    },

    stopCurrentMusic: function () {
      if (this.currentSource) {
        this.currentSource.disconnect();
        this.currentSource = null;
      }
    },

    pauseCurrentMusic: function () {
      if (this.currentSource) {
        this.currentSource.mediaElement.pause();
      }
    },

    setVolume: function (volume, duration = 1) {
      const gain = this.gainNode.gain;
      gain.setValueAtTime(this.currentGain, this.context.currentTime);
      gain.linearRampToValueAtTime(volume, this.context.currentTime + duration);
      this.currentGain = volume;
    },

    applyMuffleEffect: function () {
      if (this.muffleFilter) return;

      const filter = this.context.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = this.muffleFrequency;

      this.currentSource.disconnect();
      this.currentSource.connect(filter);
      filter.connect(this.context.destination);

      filter.frequency.setValueAtTime(20000, this.context.currentTime);
      filter.frequency.linearRampToValueAtTime(this.muffleFrequency, this.context.currentTime + this.muffleFadeDuration);

      this.muffleFilter = filter;
    },

    disableMuffleEffect: function () {
      if (!this.muffleFilter) return;

      const filter = this.muffleFilter;

      filter.frequency.setValueAtTime(this.muffleFrequency, this.context.currentTime);
      filter.frequency.linearRampToValueAtTime(20000, this.context.currentTime + this.muffleFadeDuration);

      setTimeout(() => {
        filter.type = 'allpass';
      }, this.fadeDuration * 1000);

      this.muffleFilter = null;
    }
  };

  MusicController.init();

  exports.MusicController = MusicController;
})(window);
