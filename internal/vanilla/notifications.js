!(function (exports) {
  'use strict';

  const { ipcRenderer } = require('electron');

  function OrchidNotification (title, options) {
    this.title = title;
    this.options = options;
  }

  OrchidNotification.prototype.requestPermission = function () {
    // ...
  };

  OrchidNotification.prototype.show = function () {
    ipcRenderer.send('message', {
      type: 'notification',
      options: this.options,
      href: location.href,
      origin: location.origin,
      title: document.title
    });
  };

  OrchidNotification.prototype.close = function () {
    // ...
  };

  OrchidNotification.prototype.addEventListener = function (eventType, callback) {
    // ...
  };

  OrchidNotification.prototype.permission = 'granted';

  module.exports = OrchidNotification;
})(window);
