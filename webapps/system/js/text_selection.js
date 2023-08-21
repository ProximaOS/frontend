!(function (exports) {
  'use strict';

  const TextSelection = {
    screen: document.getElementById('screen'),
    element: document.getElementById('text-selection'),

    init: function () {},

    show: function (text, x, y) {
      this.screen.classList.add('text-selection-visible');
      this.element.classList.add('visible');

      if (x > (window.innerWidth - (this.element.getBoundingClientRect().width + 10))) {
        x = window.innerWidth - (this.element.getBoundingClientRect().width + 10);
      }

      this.element.style.left = `${x}px`;
      this.element.style.top = `${y - 50}px`;
    },

    hide: function () {
      this.element.classList.remove('visible');
    }
  };

  TextSelection.init();

  exports.TextSelection = TextSelection;
})(window);
