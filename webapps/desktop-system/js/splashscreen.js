const Splashscreen = {
  splashElement: document.getElementById('splashscreen'),
  videoElement: document.getElementById('splashscreen-video'),

  bootAnimationFile: '/resources/videos/splashscreen.mp4',

  init: function () {
    this.videoElement.src = this.bootAnimationFile;
    this.videoElement.play();
    document.addEventListener('DOMContentLoaded', this.onLoad.bind(this));
  },

  onLoad: function () {
    this.splashElement.classList.add('hidden');
  }
};

Splashscreen.init();
