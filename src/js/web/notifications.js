!(function () {
  'use strict';

  class OrchidNotification {
    constructor(title, options) {
      this.title = title;
      this.options = options;
    }

    requestPermission() {
      // ...
    }

    show() {
      // ...
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
