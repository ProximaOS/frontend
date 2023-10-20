!(function (exports) {
  'use strict';

  window.alert = window._alert;
  window.confirm = window._confirm;
  window.prompt = window._prompt;
  window.Notification = window.OrchidNotification;
})(window);
