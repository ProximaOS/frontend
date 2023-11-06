!(function (exports) {
  'use strict';

  const VideoPlayer = {
    mediaElements: null,

    init: function () {
      this.mediaElements = document.querySelectorAll(':not(video-container) > video');
      this.mediaElements.forEach(this.handleEachElement.bind(this));
    },

    handleEachElement: function (mediaElement) {
      if (location.host.includes('system.localhost') || mediaElement.nodeName !== 'VIDEO') {
        return;
      }

      const videoContainer = document.createElement('video-container');
      mediaElement.parentElement.appendChild(videoContainer);
      videoContainer.appendChild(mediaElement);
    }
  };

  VideoPlayer.init();
})(window);
