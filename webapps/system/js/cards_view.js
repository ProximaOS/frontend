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
    },

    createCard: async function (index, manifestUrl, appWindow, webview) {
      const cardArea = document.createElement('div');
      cardArea.classList.add('card-area');
      cardArea.style.transform = `translateX(${
        ((window.innerWidth * 0.65) + 15) * index
      }px)`;
      this.cardsContainer.appendChild(cardArea);

      const card = document.createElement('div');
      card.classList.add('card');
      card.dataset.manifestUrl = manifestUrl;
      card.onclick = () => {
        AppWindow.focus(appWindow.id);
        this.hide();
      };
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
    }
  };

  CardsView.init();

  exports.CardsView = CardsView;
})(window);
