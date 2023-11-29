!(function (exports) {
  'use strict';

  const TextSelection = {
    screen: document.getElementById('screen'),
    element: document.getElementById('text-selection'),
    gripperStart: document.getElementById('text-selection-gripper-start'),
    gripperEnd: document.getElementById('text-selection-gripper-end'),

    init: function () {},

    show: function (text, x, y, width, height) {
      this.screen.classList.add('text-selection-visible');
      this.element.classList.add('visible');
      this.gripperStart.classList.add('visible');
      this.gripperEnd.classList.add('visible');

      const elementBox = this.element.getBoundingClientRect();
      const webviewBox = document.querySelector('.appframe.active .browser-container .browser-view.active > .browser').getBoundingClientRect();

      if (x > (window.innerWidth - (elementBox.width + 10))) {
        x = window.innerWidth - (elementBox.width + 10);
      }

      this.element.style.left = `${webviewBox.left + x}px`;
      this.element.style.top = `${(webviewBox.top + y) - 50}px`;

      this.gripperStart.style.left = `${webviewBox.left + x}px`;
      this.gripperStart.style.top = `${webviewBox.top + y}px`;
      this.gripperEnd.style.left = `${webviewBox.left + x + width}px`;
      this.gripperEnd.style.top = `${webviewBox.top + y + height}px`;
    },

    hide: function () {
      this.element.classList.remove('visible');
      this.gripperStart.classList.remove('visible');
      this.gripperEnd.classList.remove('visible');
    }
  };

  TextSelection.init();

  exports.TextSelection = TextSelection;
})(window);
