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
      const kind = event.detail.kind;
      switch (kind) {
        case 'video':
          this.micIconElement.classList.add('hidden');
          this.cameraIconElement.classList.add('hidden');
          this.videoIconElement.classList.remove('hidden');
          break;

        case 'microphone':
          this.micIconElement.classList.remove('hidden');
          this.cameraIconElement.classList.add('hidden');
          this.videoIconElement.classList.add('hidden');
          break;

        case 'camera':
          this.micIconElement.classList.add('hidden');
          this.cameraIconElement.classList.remove('hidden');
          this.videoIconElement.classList.add('hidden');
          break;

        default:
          this.micIconElement.classList.add('hidden');
          this.cameraIconElement.classList.add('hidden');
          this.videoIconElement.classList.add('hidden');
          break;
      }
    }
  };

  PrivacyIndicators.init();
})(window);
