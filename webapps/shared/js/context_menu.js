!(function (exports) {
  'use strict';

  const ContextMenu = {
    screen: document.getElementById('screen'),
    overlay: document.getElementById('context-menu'),
    containerElement: document.getElementById('context-menu-content-items'),

    show: function (x, y, array) {
      if (this.screen) {
        this.screen.classList.add('context-menu-visible');
      } else {
        document.body.classList.add('context-menu-visible');
      }
      this.overlay.classList.add('visible');
      this.containerElement.innerHTML = '';

      document.onclick = () => {
        this.hide();
      };

      array.forEach((item) => {
        const element = document.createElement('li');
        this.containerElement.appendChild(element);

        if (item.type === 'separator') {
          element.classList.add('separator');
          return;
        }

        if (item.name) {
          element.textContent = item.name;
        }
        if (item.l10nId) {
          element.dataset.l10nId = item.l10nId;
        }
        if (item.disabled) {
          element.setAttribute('disabled', '');
        }
        if (item.icon) {
          element.dataset.icon = item.icon;
        }

        element.onclick = item.onclick;

        if (
          x >=
          window.innerWidth - this.overlay.getBoundingClientRect().width
        ) {
          this.overlay.style.left =
            x - this.overlay.getBoundingClientRect().width + 'px';
        } else {
          this.overlay.style.left = x + 'px';
        }
        if (
          y >=
          window.innerHeight - this.overlay.getBoundingClientRect().height
        ) {
          this.overlay.style.top =
            y - this.overlay.getBoundingClientRect().height + 'px';
          this.overlay.classList.add('bottom');
        } else {
          this.overlay.style.top = y + 'px';
          this.overlay.classList.remove('bottom');
        }
      });
    },

    hide: function () {
      if (this.screen) {
        this.screen.classList.remove('context-menu-visible');
      } else {
        document.body.classList.remove('context-menu-visible');
      }
      this.overlay.classList.remove('visible');
    }
  };

  exports.ContextMenu = ContextMenu;
})(window);
