!(function (exports) {
  'use strict';

  const screen = document.getElementById('screen');

  window.addEventListener('rotate', (event) => {
    switch (event.detail.rotation) {
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
