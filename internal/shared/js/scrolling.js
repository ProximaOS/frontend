!(function (exports) {
  'use strict';

  const Scrolling = {
    init: function () {
      const allElements = document.querySelectorAll('html, section, div');

      allElements.forEach(element => {
        element.style.overflow = 'hidden';
        element.style.scrollBehavior = 'none';

        const content = document.createElement('div');
        content.style = 'position:relative;transition:all 0.3s ease';
        element.appendChild(content);

        element.querySelectorAll(':scope > *').forEach(element => {
          if (element === content) {
            return;
          }
          content.appendChild(element);
        });

        element.addEventListener('wheel', (event) => this.onWheel(event, element));
        element.addEventListener('touchstart', this.onTouchStart.bind(this));
        element.addEventListener('touchmove', this.onTouchMove.bind(this));
        element.addEventListener('touchend', this.onTouchEnd.bind(this));
      });
    },

    onWheel: function (event, element) {
      const content = element.children[0];

      if (element.offsetHeight >= content.getBoundingClientRect().height) {
        return;
      }

      const y = content.getBoundingClientRect().top - event.deltaY;
      content.style.transform = `translateY(${y}px)`;

      setTimeout(() => {
        // const newY = Math.max(content.offsetHeight, Math.min(0, y));
        // content.style.transform = `translateY(${newY}px)`;
      }, 500);
    },

    onTouchStart: function (event, element) {
    },

    onTouchMove: function (event, element) {
    },

    onTouchEnd: function (event, element) {
    }
  };

  Scrolling.init();
})(window);
