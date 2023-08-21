!(function (exports) {
  'use strict';

  const { ipcRenderer } = require('electron');

  const screen = document.getElementById('screen');

  ipcRenderer.on('rotate', (event, data) => {
    switch (data.rotation) {
      case '-90deg':
        screen.classList.add('rotated-left');
        screen.classList.remove('rotated-right');
        screen.classList.remove('rotated-down');
        break;

      case '90deg':
        screen.classList.remove('rotated-left');
        screen.classList.add('rotated-right');
        screen.classList.remove('rotated-down');
        break;

      case '180deg':
        screen.classList.remove('rotated-left');
        screen.classList.remove('rotated-right');
        screen.classList.add('rotated-down');
        break;

      default:
        screen.classList.remove('rotated-left');
        screen.classList.remove('rotated-right');
        screen.classList.remove('rotated-down');
        break;
    }
  });
})(window);
