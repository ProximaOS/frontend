!(function (exports) {
  'use strict';

  const { ipcRenderer } = require('electron');

  const PictureInPicture = {
    mediaElements: null,

    settings: ['browser.picture_in_picture.enabled'],
    SETTINGS_PICTURE_IN_PICTURE: 0,

    init: function () {
      this.mediaElements = document.querySelectorAll('video');
      this.mediaElements.forEach(this.handleEachElement.bind(this));
    },

    handleEachElement: function (mediaElement) {
      if (location.host.includes('system.localhost') || mediaElement.nodeName !== 'VIDEO') {
        return;
      }

      const existingButton = mediaElement.parentElement.querySelector('.openorchid-pip-button');
      if (existingButton) {
        return;
      }

      const button = document.createElement('button');
      button.classList.add('openorchid-pip-button');
      button.addEventListener('click', () => {
        button.classList.toggle('enabled');
        if (button.classList.contains('enabled')) {
          this.requestPictureInPicture(mediaElement);
        } else {
          this.stopPictureInPicture(mediaElement);
        }
      });
      mediaElement.parentElement.appendChild(button);
    },

    requestPictureInPicture: function (mediaElement) {
      mediaElement.pause();
      ipcRenderer.send('message', {
        type: 'picture-in-picture',
        videoUrl: (mediaElement.src || mediaElement.querySelector('source').src).startsWith('http')
          ? mediaElement.src || mediaElement.querySelector('source').src
          : location.origin + (mediaElement.src || mediaElement.querySelector('source').src),
        timestamp: mediaElement.currentTime,
        action: 'enable'
      });
    },

    stopPictureInPicture: function (mediaElement) {
      mediaElement.play();
      ipcRenderer.send('message', {
        type: 'picture-in-picture',
        action: 'disable'
      });
    }
  };

  PictureInPicture.init();
})(window);
