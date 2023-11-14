!(function (exports) {
  'use strict';

  const DataIcon = {
    iconElement: document.getElementById('statusbar-cellular-data'),

    init: function () {
      this.update();
    },

    update: function () {
      this.iconElement.classList.add('hidden');

      clearTimeout(this.timer);
      this.timer = setTimeout(this.update.bind(this), 1000);
    }
  };

  DataIcon.init();
})(window);
