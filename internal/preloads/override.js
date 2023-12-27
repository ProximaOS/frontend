!(function (exports) {
  // 'use strict';

  if (navigator.userAgent.includes('Mobile') && !navigator.userAgent.includes('Featurephone') && !navigator.userAgent.includes('Qwertyphone')) {
    exports.deviceType = 'mobile';
  } else if (navigator.userAgent.includes('Smart TV')) {
    exports.deviceType = 'smart-tv';
  } else if (navigator.userAgent.includes('VR')) {
    exports.deviceType = 'vr';
  } else if (navigator.userAgent.includes('Homepad')) {
    exports.deviceType = 'homepad';
  } else if (navigator.userAgent.includes('Wear')) {
    exports.deviceType = 'wear';
  } else if (navigator.userAgent.includes('Mobile') && navigator.userAgent.includes('Featurephone')) {
    exports.deviceType = 'featurephone';
  } else if (navigator.userAgent.includes('Mobile') && navigator.userAgent.includes('Qwertyphone')) {
    exports.deviceType = 'qwertyphone';
  } else {
    exports.deviceType = 'desktop';
  }

  exports.open = sessionOverride.open;
  exports.Notification = sessionOverride.Notification;
  exports.alert = sessionOverride.alert;
  exports.confirm = sessionOverride.confirm;
  exports.prompt = sessionOverride.prompt;

  document.addEventListener('visibilitychange', () => {
    const state = window.getDocumentVisibilityState();
    const hidden = state === 'hidden';

    document.orchidVisibilityState = state;
    document.orchidHidden = hidden;
  });

  navigator.mediaDevices.getUserMedia = sessionOverride.getUserMedia;
})(window);
