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

      document.addEventListener('click', this.hide.bind(this));

      const createList = (array, parentElement) => {
        array.forEach((item) => {
          if (item.hidden) {
            return;
          }
          const element = document.createElement('li');
          parentElement.appendChild(element);
          element.focus();

          switch (item.type) {
            case 'separator':
              element.classList.add('separator');
              break;

            case 'nav':
              element.classList.add('nav');

              const list = document.createElement('ul');
              element.appendChild(list);

              createList(item.buttons, list);
              break;

            default:
              if (item.name) {
                element.textContent = item.name;
              }
              if (item.l10nId) {
                element.dataset.l10nId = item.l10nId;
              }
              if (item.l10nArgs) {
                element.dataset.l10nArgs = JSON.stringify(item.l10nArgs);
              }
              if (item.disabled) {
                element.setAttribute('disabled', '');
              }
              if (item.icon) {
                element.dataset.icon = item.icon;
              }

              element.onclick = item.onclick;
              break;
          }
        });

        if (x >= window.innerWidth - this.overlay.offsetWidth) {
          this.overlay.style.left = x - this.overlay.offsetWidth + 15 + 'px';
          if (this.overlay.offsetLeft <= 0) {
            this.overlay.style.left = 0;
          }
        } else {
          this.overlay.style.left = x - 10 + 'px';
        }
        if (
          y >=
          window.innerHeight - this.overlay.getBoundingClientRect().height - 10
        ) {
          this.overlay.style.top =
            y - this.overlay.getBoundingClientRect().height - 10 + 'px';
          this.overlay.classList.add('bottom');
          if (this.overlay.offsetTop <= 0) {
            this.overlay.style.top = 0;
          }
        } else {
          this.overlay.style.top = y - 10 + 'px';
          this.overlay.classList.remove('bottom');
        }
      }
      createList(array, this.containerElement);
    },

    hide: function () {
      document.removeEventListener('click', this.hide.bind(this));

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
