!(function (exports) {

'use strict';

const Splashscreen = {
  splashElement: document.getElementById('splashscreen'),
  videoElement: document.getElementById('splashscreen-video'),

  bootAnimationFile: '/resources/videos/splashscreen.mp4',

  init: function () {
    this.videoElement.src = this.bootAnimationFile;
    this.videoElement.play();
  },

  hide: function () {
    this.splashElement.classList.add('hidden');
  }
};

Splashscreen.init();

exports.Splashscreen = Splashscreen;

})(window);
