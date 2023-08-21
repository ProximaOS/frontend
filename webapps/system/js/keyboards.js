!(function (exports) {
  'use strict';

  const Keyboard = {
    screen: document.getElementById('screen'),
    keyboardContainer: document.getElementById('keyboards'),

    create: function (manifestUrl) {
    },

    show: function () {
      this.screen.classList.add('keyboard-visible');
      this.keyboardContainer.classList.add('visible');
    },

    hide: function () {
      this.screen.classList.remove('keyboard-visible');
      this.keyboardContainer.classList.remove('visible');
    },

    toggle: function () {
      this.screen.classList.toggle('keyboard-visible');
      this.keyboardContainer.classList.toggle('visible');
    }
  };

  exports.Keyboard = Keyboard;
})(window);
