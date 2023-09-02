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

    init: function () {
      this.element.addEventListener(
        'click',
        this.hide.bind(this)
      );
      this.toggleButton.addEventListener(
        'click',
        this.handleToggleButton.bind(this)
      );
    },

    show: function () {
      this.isVisible = true;
      this.element.classList.add('visible');
      this.screen.classList.add('cards-view-visible');
      this.cardsContainer.innerHTML = '';

      const focusedWindow = AppWindow.focusedWindow;
      focusedWindow.classList.add('to-cards-view');
      focusedWindow.addEventListener('animationend', () =>
        focusedWindow.classList.remove('to-cards-view')
      );

      const windows = this.windowContainer.querySelectorAll('.appframe');
      windows.forEach((appWindow, index) => {
        this.createCard(
          index,
          appWindow.dataset.manifestUrl,
          appWindow,
          appWindow.querySelector('.browser.active')
        );
      });
    },

    hide: function () {
      this.isVisible = false;
      this.element.classList.remove('visible');
      this.screen.classList.remove('cards-view-visible');

      CardsView.element.style.setProperty('--offset-y', null);
      CardsView.element.style.setProperty('--scale', null);

      const focusedWindow = AppWindow.focusedWindow;
      focusedWindow.classList.add('from-cards-view');
      focusedWindow.addEventListener('animationend', () =>
        focusedWindow.classList.remove('from-cards-view')
      );
    },

    createCard: async function (index, manifestUrl, appWindow, webview) {
      const cardArea = document.createElement('div');
      cardArea.classList.add('card-area');
      cardArea.style.transform = `translateX(${
        (window.innerWidth * 0.65 + 15) * index
      }px)`;
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
      card.addEventListener('mousedown', (event) => this.onPointerDown(event, card));
      card.addEventListener('touchstart', (event) => this.onPointerDown(event, card));
      cardArea.appendChild(card);

      let manifest;
      await fetch(manifestUrl)
        .then((response) => response.json())
        .then(function (data) {
          manifest = data;
          // You can perform further operations with the 'manifest' variable here
        })
        .catch(function (error) {
          console.log('Error fetching manifest:', error);
        });

      const preview = document.createElement('img');
      preview.classList.add('preview');
      webview.capturePage().then((data) => {
        preview.src = data.toDataURL();
      });
      card.appendChild(preview);

      const titlebar = document.createElement('div');
      titlebar.classList.add('titlebar');
      card.appendChild(titlebar);

      const icon = document.createElement('img');
      icon.crossOrigin = 'anonymous';
      Object.entries(manifest.icons).forEach((entry) => {
        if (entry[0] >= this.APP_ICON_SIZE) {
          return;
        }
        const url = new URL(manifestUrl);
        icon.src = url.origin + '/' + entry[1];
      });
      icon.onerror = () => {
        icon.src = '/style/images/default.png';
      };
      titlebar.appendChild(icon);

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
    onPointerDown: function (event, card) {
      event.preventDefault();
      // Get initial position
      const initialY = event.pageY || event.touches[0].pageY;

      // Get initial window position
      const initialWindowY = card.offsetTop;

      // Calculate the offset between the initial position and the window position
      const offsetY = initialY - initialWindowY;

      // Attach event listeners for dragging
      document.addEventListener('mousemove', dragWindow);
      document.addEventListener('touchmove', dragWindow);
      document.addEventListener('mouseup', stopDrag);
      document.addEventListener('touchend', stopDrag);

      const that = this;

      // Function to handle dragging
      function dragWindow(event) {
        event.preventDefault();
        const y = event.pageY || event.touches[0].pageY;

        // Calculate the new position of the window
        const newWindowY = y - offsetY;

        // Set the new position of the window
        that.element.style.top = newWindowY + 'px';
      }

      // Function to stop dragging
      function stopDrag(event) {
        event.preventDefault();
        AppWindow.containerElement.classList.remove('dragging');

        that.element.classList.add('transitioning-bouncy');
        that.element.addEventListener('transitionend', () =>
          that.element.classList.remove('transitioning-bouncy')
        );
        that.element.classList.remove('dragging');

        document.removeEventListener('mousemove', dragWindow);
        document.removeEventListener('touchmove', dragWindow);
        document.removeEventListener('mouseup', stopDrag);
        document.removeEventListener('touchend', stopDrag);
      }
    }
  };

  CardsView.init();

  exports.CardsView = CardsView;
})(window);
