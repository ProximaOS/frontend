!(function (exports) {
  'use strict';

  const CellularDataIcon = {
    iconElement: document.getElementById('statusbar-cellular-signal'),

    init: function () {
      if ('Telephony' in window) {
        this.iconElement.classList.remove('hidden');
        this.iconElement.dataset.icon = 'signal-searching';
      } else {
        this.iconElement.classList.add('hidden');
        this.iconElement.dataset.icon = 'signal-0';
      }
    }
  };

  CellularDataIcon.init();
})(window);
