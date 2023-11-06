!(function (exports) {
  'use strict';

  window.Notification = sessionOverride.Notification;
  window.alert = sessionOverride.alert;
  window.confirm = sessionOverride.confirm;
  window.prompt = sessionOverride.prompt;

  navigator.mediaDevices.getUserMedia = sessionOverride.getUserMedia;
})(window);
