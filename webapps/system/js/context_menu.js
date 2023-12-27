!(function (exports) {
  'use strict';

  const ContextMenu = {
    screen: document.getElementById('screen'),
    overlay: document.getElementById('context-menu'),
    containerElement: document.getElementById('context-menu-content-items'),

    activeButton: null,

    LOCALIZED_KEYBINDS: ['meta', 'ctrl', 'alt', 'shift', 'enter', 'space', 'menu'],
    SOUND_CLICK: new Audio('/resources/sounds/menu_click.wav'),

    show: function (x, y, array, button = null) {
      if (this.screen) {
        this.screen.classList.add('context-menu-visible');
      } else {
        document.body.classList.add('context-menu-visible');
      }
      this.overlay.classList.add('visible');
      this.containerElement.innerHTML = '';

      document.addEventListener('click', this.onClick.bind(this));
      this.overlay.addEventListener('click', this.onMenuClick.bind(this));

      this.createList(array, this.containerElement, x, y);

      if (button) {
        button.classList.add('active');
        this.activeButton = button;
      } else {
        this.activeButton = null;
      }
    },

    createList: function (array, parentElement, x, y) {
      const fragment = document.createDocumentFragment();

      for (let index = 0, length = array.length; index < length; index++) {
        const item = array[index];

        if (item.hidden) {
          continue;
        }
        const element = document.createElement('li');
        element.addEventListener('pointerdown', this.onPointerDown.bind(this));
        element.addEventListener('pointerup', this.onPointerUp.bind(this));
        element.addEventListener('pointerenter', (event) => this.onPointerEnter(event, element));
        element.addEventListener('pointerleave', (event) => this.onPointerLeave(event, element));
        fragment.appendChild(element);

        element.addEventListener('pointerup', () => {
          this.hide();
        });

        switch (item.type) {
          case 'separator':
            element.classList.add('separator');
            break;

          case 'nav':
            element.classList.add('nav');

            const list = document.createElement('ul');
            element.appendChild(list);

            this.createList(item.buttons, list, x, y);
            break;

          default:
            const name = document.createElement('span');
            if (item.l10nId) {
              name.dataset.l10nId = item.l10nId;
              element.appendChild(name);

              if (item.l10nArgs) {
                name.dataset.l10nArgs = JSON.stringify(item.l10nArgs);
              }
            } else if (item.name && !item.l10nId) {
              name.textContent = item.name;
              element.appendChild(name);
            }

            if (item.disabled) {
              element.setAttribute('disabled', '');
            }
            if (item.icon) {
              element.dataset.icon = item.icon;
            }
            if (item.isNewlyAdded) {
              const newMark = document.createElement('span');
              newMark.classList.add('new');
              newMark.dataset.l10nId = 'new';
              element.appendChild(newMark);
            }
            if (item.keybind) {
              const keybind = document.createElement('span');
              keybind.classList.add('keybind');
              keybind.textContent = item.keybind.map((a) => (this.LOCALIZED_KEYBINDS.indexOf(a) !== -1 ? L10n.get(`keybinds-${a}`) : a)).join('+');
              element.appendChild(keybind);
            }

            element.addEventListener('pointerup', item.onclick);
            break;
        }
      }

      parentElement.appendChild(fragment);

      requestAnimationFrame(() => {
        if (x >= window.innerWidth / 2) {
          if (this.activeButton) {
            this.overlay.style.left = x - this.overlay.offsetWidth + this.activeButton.getBoundingClientRect().width + 'px';
          } else {
            this.overlay.style.left = x - this.overlay.offsetWidth + 'px';
          }

          if (this.overlay.offsetLeft <= 0) {
            this.overlay.style.left = 0;
          }
        } else {
          this.overlay.style.left = x + 'px';
        }
        if (y >= window.innerHeight - this.overlay.getBoundingClientRect().height) {
          this.overlay.style.top = y - this.overlay.getBoundingClientRect().height + 'px';
          this.overlay.classList.add('bottom');
          if (this.overlay.offsetTop <= 0) {
            this.overlay.style.top = 0;
          }
        } else {
          this.overlay.style.top = y + 'px';
          this.overlay.classList.remove('bottom');
        }
      });
    },

    onClick: function (event) {
      this.hide();
    },

    onPointerDown: function (event) {
      this.isDragging = true;
      this.overlay.classList.add('dragging');
    },

    onPointerUp: function (event) {
      this.isDragging = false;
      this.overlay.classList.remove('dragging');
    },

    onPointerEnter: function (event, element) {
      if (!this.isDragging) {
        return;
      }
      element.classList.add('active');

      this.SOUND_CLICK = new Audio('/resources/sounds/menu_click.wav');
      this.SOUND_CLICK.currentTime = 0;
      this.SOUND_CLICK.play();
    },

    onPointerLeave: function (event, element) {
      if (!this.isDragging) {
        return;
      }
      element.classList.remove('active');
    },

    onMenuClick: function (event) {
      event.stopPropagation();
    },

    hide: function () {
      if (this.screen) {
        this.screen.classList.remove('context-menu-visible');
      } else {
        document.body.classList.remove('context-menu-visible');
      }
      this.overlay.classList.remove('visible');

      if (this.activeButton) {
        this.activeButton.classList.remove('active');
      }
    }
  };

  exports.ContextMenu = ContextMenu;
})(window);
