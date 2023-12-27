!(function (exports) {
  'use strict';

  const TitleTooltip = {
    element: document.getElementById('title-tooltip'),
    label: document.getElementById('title-tooltip-label'),
    previousLabel: document.getElementById('title-tooltip-label-previous'),

    show: function (text, x, y, originType) {
      this.element.classList.add('visible');

      if (this.label !== text) {
        this.previousLabel.innerText = this.label.innerText;
        this.label.innerText = text;

        this.label.classList.add('blur-in');
        this.label.addEventListener('animationend', () => {
          this.label.classList.remove('blur-in');
        });

        this.previousLabel.classList.add('blur-out');
        this.previousLabel.addEventListener('animationend', () => {
          this.previousLabel.classList.remove('blur-out');
        });
      }

      const elementBox = this.element.getBoundingClientRect();
      const webviewBox = document
        .querySelector('.appframe.active .browser-container .browser-view.active > .browser')
        .getBoundingClientRect();

      requestAnimationFrame(() => {
        if (x > window.innerWidth - (elementBox.width + 10)) {
          x = window.innerWidth - (elementBox.width + 10);
        }

        this.element.style.width = this.label.scrollWidth + 'px';
        this.element.style.height = this.label.scrollHeight + 'px';
        if (originType === 'webapp') {
          this.element.style.left = `${webviewBox.left + x}px`;
          this.element.style.top = `${webviewBox.top + 24}px`;
        } else {
          this.element.style.left = `${x}px`;
          this.element.style.top = `${y + 24}px`;
        }
      });
    },

    hide: function () {
      this.element.classList.remove('visible');
    }
  };

  exports.TitleTooltip = TitleTooltip;
})(window);
