!(function (exports) {
  'use strict';

  const Webapps = {
    gridColumns: 4,
    gridRows: 6,
    HIDDEN_ROLES: ['homescreen', 'keyboard', 'system', 'theme', 'addon'],
    ALLOWED_APPS: ['smart_tv'],

    app: document.getElementById('app'),
    webappsContainer: document.getElementById('webapps-list'),
    selectionName: document.getElementById('selection-name'),
    selectionDescription: document.getElementById('selection-description'),
    shortcuts: document.getElementById('shortcuts'),
    shortcutsMenu: document.getElementById('shortcuts-menu'),
    shortcutsList: document.getElementById('shortcuts-menu-options'),
    shortcutsFakeIcon: document.getElementById('shortcuts-fake-icon'),
    apps: [],

    isHoldingDown: false,
    timer: null,
    timePassed: 0,

    APP_ARTWORK_SIZE: 320,

    init: function () {
      document.addEventListener('click', this.onClick.bind(this));
      this.webappsContainer.addEventListener('pointerdown', this.onPointerDown.bind(this));
      this.webappsContainer.addEventListener('pointerup', this.onPointerUp.bind(this));
      this.webappsContainer.addEventListener('contextmenu', this.handleContextMenu.bind(this));
      window.addEventListener('ipc-message', this.handleIPCMessage.bind(this));

      const apps = AppsManager.getAll();
      apps.then((data) => {
        this.apps = data;
        this.createIcons();
      });
    },

    applyParallaxEffect: function (element) {
      // Get the dimensions of the screen
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      // Calculate the center of the screen
      const centerX = screenWidth / 2;
      const centerY = screenHeight / 2;

      // Calculate the center of the rectangle
      const rect = element.getBoundingClientRect();
      const rectCenterX = rect.left + rect.width / 2;
      const rectCenterY = rect.top + rect.height / 2;

      // Calculate the distance between the rectangle center and the screen center
      const distance = Math.sqrt(Math.pow(rectCenterX - centerX, 2) + Math.pow(rectCenterY - centerY, 2));

      // Apply CSS transformations
      element.style.setProperty('--pos-z', `${distance}px`);
    },

    createIcons: function () {
      this.apps = this.apps.filter((obj) => this.HIDDEN_ROLES.indexOf(obj.manifest.role || '') === -1);
      this.apps = this.apps.filter((obj) => {
        if (obj.manifest.platforms) {
          return obj.manifest.platforms.some(item => this.ALLOWED_APPS.includes(item));
        } else {
          return false;
        }
      });

      const fragment = document.createDocumentFragment();
      for (let index = 0; index < this.apps.length; index++) {
        const app = this.apps[index];
        this.createAppCard(fragment, app, index);
      }
      setTimeout(() => {
        this.webappsContainer.appendChild(fragment);
        if ('SpatialNavigation' in window) {
          SpatialNavigation.makeFocusable();
        }
      }, 300);
    },

    createAppCard: async function (container, app, index) {
      let langCode;
      try {
        langCode = L10n.currentLanguage || 'en-US';
      } catch (error) {
        // If an error occurs, set a default value for langCodes
        langCode = 'en-US';
      }

      let manifestUrl;
      if (app.manifestUrl[langCode]) {
        manifestUrl = app.manifestUrl[langCode];
      } else {
        manifestUrl = app.manifestUrl['en-US'];
      }

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

      const icon = document.createElement('li');
      icon.id = `appicon${index}`;
      icon.classList.add('webapp');
      container.appendChild(icon);
      this.applyParallaxEffect(icon);
      icon.addEventListener('click', (event) => this.handleAppClick(event, app, artwork));
      icon.addEventListener('contextmenu', (event) => this.handleIconContextMenu(event, app, artwork));
      icon.addEventListener('focus', () => this.handleAppSelect(app));
      icon.addEventListener('pointerover', () => this.handleAppSelect(app));

      const artworkHolder = document.createElement('div');
      artworkHolder.classList.add('artwork-holder');
      icon.appendChild(artworkHolder);

      let artwork;
      if (app.manifest.homescreen && app.manifest.homescreen.dynamic_artwork && app.manifest.homescreen.dynamic_artwork.start_url) {
        artwork = document.createElement('iframe');
        artwork.classList.add('artwork');
        const url = new URL(manifestUrl);
        artwork.src = url.origin + app.manifest.homescreen.dynamic_artwork.start_url;
        artworkHolder.appendChild(artwork);
      } else {
        artwork = document.createElement('img');
        artwork.classList.add('artwork');
        artwork.draggable = false;
        artwork.crossOrigin = 'anonymous';

        if (app.manifest && app.manifest.artworks) {
          Object.entries(app.manifest.artworks).forEach((entry) => {
            if (entry[0] <= this.APP_ARTWORK_SIZE) {
              return;
            }
            const url = new URL(app.manifestUrl['en-US']);
            artwork.src = url.origin + entry[1];
          });
        } else {
          artwork.src = '/images/default.svg';
        }

        artwork.onerror = () => {
          artwork.src = '/images/default.svg';
        };
        artworkHolder.appendChild(artwork);
      }

      const name = document.createElement('div');
      name.classList.add('name');
      name.textContent = manifest.name;
      icon.appendChild(name);
    },

    handleAppClick: function (event, app, icon) {
      let langCode;
      try {
        langCode = L10n.currentLanguage || 'en-US';
      } catch (error) {
        // If an error occurs, set a default value for langCodes
        langCode = 'en-US';
      }

      let manifestUrl;
      if (app.manifestUrl[langCode]) {
        manifestUrl = app.manifestUrl[langCode];
      } else {
        manifestUrl = app.manifestUrl['en-US'];
      }

      const iconBox = icon.getBoundingClientRect();
      const xPos = iconBox.left + iconBox.width / 2;
      const yPos = iconBox.top + iconBox.height / 2;
      const xScale = iconBox.width / window.innerWidth;
      const yScale = iconBox.height / window.innerHeight;
      const iconXPos = iconBox.left;
      const iconYPos = iconBox.top;
      const iconXScale = iconBox.width / window.innerWidth;
      const iconYScale = iconBox.height / window.innerHeight;

      if (!Webapps.isDragging) {
        // Dispatch the custom event with the manifest URL
        IPC.send('message', {
          type: 'launch',
          manifestUrl,
          xPos,
          yPos,
          xScale,
          yScale,
          iconXPos,
          iconYPos,
          iconXScale,
          iconYScale
        });
      }
    },

    handleAppSelect: function (app) {
      Counter.increment(this.selectionName, app.manifest.name);
      Counter.increment(this.selectionDescription, app.manifest.description);
    },

    onClick: function (event) {
      if (event.target === this.shortcuts) {
        this.shortcuts.classList.remove('visible');
      }
    },

    onPointerDown: function () {
      this.isHoldingDown = true;
      this.timer = setInterval(() => {
        if (this.timePassed < 500 && this.isHoldingDown) {
          this.timePassed += 10;
          if (this.timePassed >= 500) {
            this.app.dataset.editMode = !this.app.dataset.editMode.trim();
          }
        }
      }, 10);
    },

    onPointerUp: function () {
      this.timePassed = 0;
      this.isHoldingDown = false;
    },

    handleContextMenu: function () {
      this.app.dataset.editMode = !this.app.dataset.editMode.trim();
    },

    handleIconContextMenu: async function (event, app, icon) {
      event.preventDefault();
      event.stopPropagation();

      let langCode;
      try {
        langCode = L10n.currentLanguage || 'en-US';
      } catch (error) {
        // If an error occurs, set a default value for langCode
        langCode = 'en-US';
      }

      let manifestUrl;
      if (app.manifestUrl[langCode]) {
        manifestUrl = app.manifestUrl[langCode];
      } else {
        manifestUrl = app.manifestUrl['en-US'];
      }

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

      this.element.classList.add('shortcuts-visible');
      this.shortcuts.classList.add('visible');

      const launcherBox = this.element.getBoundingClientRect();
      const iconBox = icon.getBoundingClientRect();

      Object.entries(app.manifest.icons).forEach((entry) => {
        if (entry[0] <= this.APP_ICON_SIZE) {
          return;
        }
        this.shortcutsFakeIcon.src = entry[1];
      });
      this.shortcutsFakeIcon.onerror = () => {
        this.shortcutsFakeIcon.src = '/images/default.svg';
      };
      this.shortcutsFakeIcon.style.left = iconBox.left - launcherBox.left + 'px';
      this.shortcutsFakeIcon.style.top = iconBox.top - launcherBox.top + 'px';

      this.shortcutsList.innerHTML = '';
      if (manifest && manifest.shortcuts) {
        this.shortcutsList.style.display = 'block';
        for (let index = 0; index < manifest.shortcuts.length; index++) {
          const shortcut = manifest.shortcuts[index];

          const item = document.createElement('li');
          this.shortcutsList.appendChild(item);

          const iconHolder = document.createElement('div');
          iconHolder.classList.add('icon-holder');
          item.appendChild(iconHolder);

          const icon = document.createElement('img');
          const url = new URL(app.manifestUrl['en-US']);
          icon.src = url.origin + shortcut.icon;
          icon.classList.add('icon');
          iconHolder.appendChild(icon);

          const name = document.createElement('div');
          name.classList.add('name');
          name.textContent = shortcut.name;
          item.appendChild(name);
        }
      } else {
        this.shortcutsList.style.display = 'none';
      }

      this.shortcutsMenu.style.top = iconBox.top - launcherBox.top + 60 + 'px';
      if (iconBox.left > window.innerWidth - this.shortcutsMenu.clientWidth) {
        this.shortcutsMenu.style.left = iconBox.left - launcherBox.left - this.shortcutsMenu.clientWidth + 50 + 'px';
      } else {
        this.shortcutsMenu.style.left = iconBox.left - launcherBox.left + 'px';
      }
      Transitions.scale(icon, this.shortcutsMenu, true);
    },

    handleIPCMessage: function (event) {
      const data = event.detail;

      if (data.type === 'lockscreen') {
        if (data.action === 'unlock') {
          this.app.classList.remove('hidden');
        } else {
          this.app.classList.add('hidden');
        }
      }
    }
  };

  Webapps.init();
})(window);
