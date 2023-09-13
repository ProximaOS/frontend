!(function (exports) {
  'use strict';

  const Bluetooth = {
    isEnabled: false,

    iconElement: document.getElementById('statusbar-bluetooth'),
    toggleButton: document.getElementById('quick-settings-bluetooth'),

    init: function () {
      this.toggleButton.addEventListener('click', () => {
        Bluetooth.toggle();
      });
    },

    enable: function () {
      this.isEnabled = true;
      this.toggleButton.parentElement.classList.add('enabled');
      this.iconElement.classList.remove('hidden');
    },

    disable: function () {
      this.isEnabled = false;
      this.toggleButton.parentElement.classList.remove('enabled');
      this.iconElement.classList.add('hidden');
    },

    toggle: function () {
      if (this.isEnabled) {
        this.disable();
      } else {
        this.enable();
      }
    }
  };

  Bluetooth.init();
})(window);
