!(function (exports) {
  'use strict';

  const { ipcRenderer } = require('electron');
  const uuid = require('uuid');

  class OrchidNotification {
    constructor (title, options) {
      this.title = title;
      this.options = options;
      this.permission = 'granted';

      this.ID = uuid.v4();
      this.show();
    }

    requestPermission () {
      return new Promise((resolve, reject) => {
        resolve(this.permission);
      });
    }

    show () {
      ipcRenderer.send('message', {
        type: 'notification',
        action: 'show',
        name: this.title,
        options: this.options,
        href: location.href,
        origin: location.origin,
        title: document.title,
        id: this.ID
      });
    }

    close () {
      ipcRenderer.send('message', {
        type: 'notification',
        action: 'hide',
        id: this.ID
      });
    }

    addEventListener (eventType, callback) {
      // ...
    }
  }

  module.exports = OrchidNotification;
})(window);
