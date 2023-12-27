!(function (exports) {
  'use strict';

  const { ipcRenderer } = require('electron');

  const MediaPlayback = {
    mediaElements: null,

    init: function () {
      this.mediaElements = document.querySelectorAll('audio, video');
      this.mediaElements.forEach(this.handleEachElement.bind(this));
    },

    convertToAbsoluteUrl: function (relativeUrl) {
      const baseUrl = window.location.origin;
      return new URL(relativeUrl, baseUrl).href;
    },

    getFileAsUint8Array: async function (url) {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      return new Uint8Array(arrayBuffer);
    },

    handleEachElement: function (mediaElement) {
      mediaElement.addEventListener('play', (event) => {
        const url = this.convertToAbsoluteUrl(mediaElement.src);
        this.getFileAsUint8Array(url).then((data) => {
          // musicMetadata.parseBuffer(data, mime.getType(url)).then((metadata) => {
          //   const common = metadata.common;
          //   this.sendMediaPlayEvent(common);
          // });
        });
      });
      mediaElement.addEventListener('pause', function (event) {
        ipcRenderer.send('mediapause', {});
      });
    },

    sendMediaPlayEvent: function (common) {
      ipcRenderer.send('mediaplay', {
        title: common.title,
        artist: common.artist,
        album: common.album,
        artwork: `data:${common.picture.format};base64,${common.picture.data.toString('base64')}`,
        date: common.date
      });
    }
  };

  try {
    MediaPlayback.init();
  } catch(error) {
    console.error(error);
  }
})(window);
