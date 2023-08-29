!(function (exports) {
  'use strict';

  const PlatformClassifier = {
    screen: document.getElementById('screen'),

    init: function () {
      this.screen.classList.add(platform());
    }
  };

  PlatformClassifier.init();
})(window);
