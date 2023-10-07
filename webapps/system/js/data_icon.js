!(function (exports) {
  'use strict';

  const DataIcon = {
    iconElement: document.getElementById('statusbar-data'),

    init: function () {
      this.update();
    },

    update: function () {
      this.iconElement.classList.remove('visible');

      clearTimeout(this.timer);
      this.timer = setTimeout(this.update, 1000);
    }
  };

  DataIcon.init();
})(window);
