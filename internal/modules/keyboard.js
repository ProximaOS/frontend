!(function (exports) {
  'use strict';

  const { ipcRenderer } = require('electron');

  const Keyboard = {
    inputAreas: null,

    init: function () {
      this.inputAreas = document.querySelectorAll('input[type=text], input[type=name], input[type=email], input[type=password], input[type=number], textarea');
      this.inputAreas.forEach((inputElement) => {
        inputElement.addEventListener('focus', this.onFocus.bind(this));
      });

      document.addEventListener('click', this.onClick.bind(this));
    },

    onFocus: function (event) {
      ipcRenderer.send('message', {
        type: 'keyboard',
        action: 'show',
        origin: location.href
      });
    },

    onClick: function (event) {
      if (['INPUT', 'TEXTAREA'].indexOf(event.target.nodeName) === -1) {
        ipcRenderer.send('message', {
          type: 'keyboard',
          action: 'hide',
          origin: location.href
        });
      }
    }
  };

  Keyboard.init();
})(window);
