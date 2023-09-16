!(function (exports) {
  'use strict';

  const Screenshots = {
    screen: document.getElementById('screen'),

    init: function () {
      document.addEventListener('keyup', this.onKeyPress.bind(this));
    },

    onKeyPress: function (event) {
      if (event.key === 's' && event.altKey) {
        this.take();
      }
    },

    take: function () {
      this.screen.classList.add('screenshot');
      this.screen.addEventListener('animationend', () => {
        this.screen.classList.remove('screenshot');
      });
    }
  };

  Screenshots.init();
})(window);
