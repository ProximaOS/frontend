!(function (exports) {
  'use strict';

  exports.alert = window._alert;
  exports.confirm = window._confirm;
  exports.prompt = window._prompt;
  exports.Notification = window.OrchidNotification;
})(window);
