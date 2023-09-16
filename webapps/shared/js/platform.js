!(function (exports) {
  'use strict';

  /**
   * Returns the codename of an OpenOrchid platform.
   * @returns
   */
  function platform () {
    if (navigator.userAgent.includes('Mobile')) {
      return 'mobile';
    } else if (navigator.userAgent.includes('Smart TV')) {
      return 'smart-tv';
    } else if (navigator.userAgent.includes('VR')) {
      return 'vr';
    } else if (navigator.userAgent.includes('Homepad')) {
      return 'homepad';
    } else if (navigator.userAgent.includes('Wear')) {
      return 'wear';
    } else {
      return 'desktop';
    }
  }

  exports.platform = platform;
})(window);
