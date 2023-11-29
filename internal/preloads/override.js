!(function (exports) {
  'use strict';

  exports.Notification = sessionOverride.Notification;
  exports.alert = sessionOverride.alert;
  exports.confirm = sessionOverride.confirm;
  exports.prompt = sessionOverride.prompt;

  navigator.mediaDevices.getUserMedia = sessionOverride.getUserMedia;
})(window);
