!(function (exports) {
  'use strict';

  const PlatformClassifier = {
    screen: document.getElementById('screen'),

    init: function () {
      this.screen.classList.add(window.deviceType);
    }
  };

  PlatformClassifier.init();
})(window);
