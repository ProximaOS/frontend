!(function (exports) {
  'use strict';

  const Snackbar = {
    element: document.getElementById('snackbar'),
    label: document.getElementById('snackbar-label'),

    TIMEOUT_DURATION: 3000,

    timer: null,

    notify: function (message) {
      this.element.classList.remove('hidden');
      this.label.textContent = message;

      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.element.classList.add('hidden');
      }, this.TIMEOUT_DURATION);
    }
  };

  exports.Snackbar = Snackbar;
})(window);
