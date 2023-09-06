!(function (exports) {
  'use strict';

  const TextSelection = {
    screen: document.getElementById('screen'),
    element: document.getElementById('text-selection'),

    init: function () {},

    show: function (text, x, y) {
      this.screen.classList.add('text-selection-visible');
      this.element.classList.add('visible');

      const elementBox = this.element.getBoundingClientRect();
      const webviewBox = document.querySelector('.appframe.active .browser-container .browser.active').getBoundingClientRect();

      if (x > (window.innerWidth - (elementBox.width + 10))) {
        x = window.innerWidth - (elementBox.width + 10);
      }

      this.element.style.left = `${webviewBox.left + x}px`;
      this.element.style.top = `${(webviewBox.top + y) - 50}px`;
    },

    hide: function () {
      this.element.classList.remove('visible');
    }
  };

  TextSelection.init();

  exports.TextSelection = TextSelection;
})(window);
