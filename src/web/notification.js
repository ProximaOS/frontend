!(function (exports) {
  'use strict';

  const { ipcRenderer } = require('electron');
  const { v4 } = require('uuid');

  class NotificationAPI {
    constructor(title, options) {
      this._id = v4();
      this.origin = location.origin;

      this.title = title;
      this.options = options;

      this.show();
    }

    requestPermission() {
      return new Promise((resolve, reject) => {
        resolve('granted');
      });
    }

    show() {
      ipcRenderer.send('message', {
        type: 'notification',
        id: this._id,
        origin: this.origin,
        action: 'show',
        title: this.title,
        options: this.options,
        notification: this
      });
    }

    close() {
      ipcRenderer.send('message', {
        type: 'notification',
        id: this._id,
        origin: this.origin,
        action: 'hide',
        notification: this
      });
    }
  }

  NotificationAPI.permission = 'granted';

  module.exports = NotificationAPI;
})(window);
