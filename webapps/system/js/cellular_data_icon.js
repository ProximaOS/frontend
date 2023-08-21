!(function (exports) {
  'use strict';

  const CellularDataIcon = {
    iconElement: document.getElementById('statusbar-cellular-signal'),

    init: function () {
      this.update();
    },

    update: function () {
      this.iconElement.classList.remove('hidden');

      clearTimeout(this.timer);
      this.timer = setTimeout(this.update, 1000);
    }
  };

  CellularDataIcon.init();
})(window);
