!(function (exports) {
  'use strict';

  const CardsView = {
    screen: document.getElementById('screen'),
    windowContainer: document.getElementById('windows'),

    element: document.getElementById('cards-view'),
    cardsContainer: document.getElementById('cards-view-list'),
    toggleButton: document.getElementById('software-recents-button'),

    APP_ICON_SIZE: 50,

    isVisible: false,
    scrollMovement: 0,

    init: function () {
      this.element.addEventListener('click', this.hide.bind(this));
      this.toggleButton.addEventListener('click', this.handleToggleButton.bind(this));

      StickyScroll.init(this.element, '.card-area');
    },

    show: function () {
      this.isVisible = true;
      this.element.classList.add('visible');
      this.screen.classList.add('cards-view-visible');
      this.cardsContainer.innerHTML = '';

      const focusedWindow = AppWindow.focusedWindow;
      focusedWindow.classList.add('to-cards-view');
      focusedWindow.addEventListener('animationend', () => focusedWindow.classList.remove('to-cards-view'));

      const windows = this.windowContainer.querySelectorAll('.appframe:not(#homescreen)');
      for (let index = 0; index < windows.length; index++) {
        const appWindow = windows[index];
        this.createCard(index, appWindow.dataset.manifestUrl, appWindow, appWindow.querySelector('.browser-view.active .browser'));
      }
    },

    hide: function () {
      this.isVisible = false;
      this.element.classList.remove('visible');
      this.screen.classList.remove('cards-view-visible');

      CardsView.element.style.setProperty('--offset-y', null);
      CardsView.element.style.setProperty('--scale', null);

      const focusedWindow = AppWindow.focusedWindow;
      focusedWindow.classList.add('from-cards-view');
      focusedWindow.addEventListener('animationend', () => focusedWindow.classList.remove('from-cards-view'));
    },

    createCard: async function (index, manifestUrl, appWindow, webview) {
      const rtl = document.dir === 'rtl';
      const x = (window.innerWidth * 0.65 + 15) * index;

      const cardArea = document.createElement('div');
      cardArea.classList.add('card-area');
      cardArea.style.transform = `translateX(${rtl ? -x : x}px)`;
      this.cardsContainer.appendChild(cardArea);

      const focusedWindow = AppWindow.focusedWindow;
      if (focusedWindow === appWindow) {
        cardArea.scrollIntoView();
      }

      const card = document.createElement('div');
      card.classList.add('card');
      card.dataset.manifestUrl = manifestUrl;
      card.addEventListener('click', (event) => {
        event.stopPropagation();
        AppWindow.focus(appWindow.id);
        this.hide();
      });
      card.addEventListener('mousedown', (event) => this.onPointerDown(event, card, appWindow.id));
      card.addEventListener('touchstart', (event) => this.onPointerDown(event, card, appWindow.id));
      cardArea.appendChild(card);

      let manifest;
      await fetch(manifestUrl)
        .then((response) => response.json())
        .then(function (data) {
          manifest = data;
          // You can perform further operations with the 'manifest' variable here
        })
        .catch(function (error) {
          console.error('Error fetching manifest:', error);
        });

      const preview = document.createElement('img');
      preview.classList.add('preview');
      DisplayManager.screenshot(webview.getWebContentsId()).then((data) => {
        preview.src = data;
      });
      card.appendChild(preview);

      const titlebar = document.createElement('div');
      titlebar.classList.add('titlebar');
      card.appendChild(titlebar);

      const icon = document.createElement('img');
      icon.crossOrigin = 'anonymous';
      icon.onerror = () => {
        icon.src = '/style/images/default.svg';
      };
      titlebar.appendChild(icon);

      const entries = Object.entries(manifest.icons);
      for (let index = 0; index < entries.length; index++) {
        const entry = entries[index];

        if (entry[0] >= this.APP_ICON_SIZE) {
          continue;
        }
        const url = new URL(manifestUrl);
        icon.src = url.origin + '/' + entry[1];
      }

      const titles = document.createElement('div');
      titles.classList.add('titles');
      titlebar.appendChild(titles);

      const name = document.createElement('div');
      name.classList.add('name');
      name.textContent = manifest.name;
      titles.appendChild(name);
    },

    handleToggleButton: function (event) {
      if (this.isVisible) {
        this.hide();
      } else {
        this.show();
      }
    },

    // Attach event listeners for mouse/touch events to handle dragging
    onPointerDown: function (event, card, windowId) {
      event.preventDefault();
      event.stopPropagation();
      this.startY = event.clientY || event.touches[0].clientY;

      // Get initial window position
      const initialWindowY = card.offsetTop;

      // Calculate the offset between the initial position and the window position
      const offsetY = this.startY - initialWindowY;

      // Function to handle dragging
      const dragWindow = (event) => {
        event.preventDefault();
        const y = event.clientY || event.touches[0].clientY;

        // Calculate the new position of the window
        const newWindowY = y - offsetY;

        // Set the new position of the window
        const progress = newWindowY / window.innerHeight;
        card.style.opacity = 1 - (progress * -1);
        card.style.transform = `translateY(${100 * progress}%) scale(0.65)`;
      }

      // Function to stop dragging
      const stopDrag = (event) => {
        event.preventDefault();
        const currentYPosition = event.clientY || event.touches[0].clientY;
        const distanceY = currentYPosition - this.startY;

        card.classList.add('transitioning');
        card.addEventListener('transitionend', () => card.classList.remove('transitioning'));
        card.classList.remove('dragging');

        if (distanceY <= -100) {
          if (windowId === 'homescreen') {
            card.style.transform = '';
          } else {
            AppWindow.close(windowId, true);
            card.style.opacity = 0;
            card.style.transform = 'translateY(-100%) scale(0.65)';
            card.addEventListener('transitionend', () => {
              card.parentElement.remove();

              if (this.cardsContainer.childNodes.length < 1) {
                this.hide();
                AppWindow.focus(AppWindow.homescreenElement.id);
              }
            });
          }
        }

        document.removeEventListener('mousemove', dragWindow);
        document.removeEventListener('touchmove', dragWindow);
        document.removeEventListener('mouseup', stopDrag);
        document.removeEventListener('touchend', stopDrag);
      }

      // Attach event listeners for dragging
      document.addEventListener('mousemove', dragWindow);
      document.addEventListener('touchmove', dragWindow);
      document.addEventListener('mouseup', stopDrag);
      document.addEventListener('touchend', stopDrag);
    }
  };

  CardsView.init();

  exports.CardsView = CardsView;
})(window);
