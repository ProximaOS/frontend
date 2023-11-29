!(function () {
  'use strict';

  const { ipcRenderer } = require('electron');

  module.exports = function (url, options) {
    ipcRenderer.send('message', {
      type: 'window',
      origin: location.origin,
      url,
      options
    });
  }
})();
