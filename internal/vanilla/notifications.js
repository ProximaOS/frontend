!(function () {
  'use strict';

  const { ipcRenderer } = require('electron');

  class OrchidNotification {
    constructor(title, options) {
      this.title = title;
      this.options = options;
    }

    requestPermission() {
      // ...
    }

    show() {
      ipcRenderer.send('message', {
        type: 'notification',
        options: this.options,
        href: location.href,
        origin: location.origin,
        title: document.title
      });
    }

    close() {
      // ...
    }

    addEventListener(eventType, callback) {
      // ...
    }
  }

  exports.OrchidNotification = OrchidNotification;
})();
