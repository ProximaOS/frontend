!(function (exports) {
  'use strict';

  const PrivacyIndicators = {
    micIconElement: document.getElementById('statusbar-microphone'),
    cameraIconElement: document.getElementById('statusbar-camera'),
    videoIconElement: document.getElementById('statusbar-video'),

    init: function () {
      window.addEventListener('mediadevicechange', this.handleDeviceChange.bind(this));
    },

    handleDeviceChange: function (event) {
      const audio = event.detail.audio;
      const video = event.detail.video;

      if (audio && video) {
        this.micIconElement.classList.add('hidden');
        this.cameraIconElement.classList.add('hidden');
        this.videoIconElement.classList.remove('hidden');
      } else if (audio) {
        this.micIconElement.classList.remove('hidden');
        this.cameraIconElement.classList.add('hidden');
        this.videoIconElement.classList.add('hidden');
      } else if (video) {
        this.micIconElement.classList.add('hidden');
        this.cameraIconElement.classList.remove('hidden');
        this.videoIconElement.classList.add('hidden');
      } else {
        this.micIconElement.classList.add('hidden');
        this.cameraIconElement.classList.add('hidden');
        this.videoIconElement.classList.add('hidden');
      }
    }
  };

  PrivacyIndicators.init();
})(window);
