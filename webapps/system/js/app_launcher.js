!(function (exports) {
  'use strict';

  const AppLauncher = {
    element: document.getElementById('launcher'),
    gridElement: document.getElementById('launcher-grid'),
    launcherButton: document.getElementById('software-launcher-button'),
    maximizeButton: document.getElementById('launcher-maximize-button'),
    shortcuts: document.getElementById('launcher-shortcuts'),
    shortcutsMenu: document.getElementById('launcher-shortcuts-menu'),
    shortcutsList: document.getElementById('launcher-shortcuts-menu-options'),
    shortcutsFakeIcon: document.getElementById('launcher-shortcuts-fake-icon'),
    paginationBar: document.getElementById('launcher-paginationBar'),
    dock: document.getElementById('dock'),
    apps: [],

    gridColumns: 6,
    gridRows: 4,
    isHoldingDown: false,
    timer: null,
    timePassed: 0,

    DEFAULT_PAGE_INDEX: 0,
    HIDDEN_ROLES: ['homescreen', 'keyboard', 'system', 'theme'],
    APP_ICON_SIZE: 45,

    DEFAULT_DOCK_ICONS: [
      `http://browser.localhost:${location.port}/manifest.json`,
      `http://sms.localhost:${location.port}/manifest.json`,
      `http://contacts.localhost:${location.port}/manifest.json`,
      `http://dialer.localhost:${location.port}/manifest.json`
    ],

    init: function () {
      this.gridElement.style.setProperty('--grid-columns', this.gridColumns);
      this.gridElement.style.setProperty('--grid-rows', this.gridRows);

      this.launcherButton.addEventListener('click', this.handleLauncherButtonClick.bind(this));
      this.maximizeButton.addEventListener('click', this.handleLauncherMaximizeButtonClick.bind(this));
      document.addEventListener('click', this.onClick.bind(this));
      this.gridElement.addEventListener(
        'pointerdown',
        this.onPointerDown.bind(this)
      );
      this.gridElement.addEventListener(
        'pointerup',
        this.onPointerUp.bind(this)
      );
      this.gridElement.addEventListener(
        'contextmenu',
        this.handleContextMenu.bind(this)
      );
      this.gridElement.addEventListener(
        'scroll',
        this.handleSwiping.bind(this)
      );

      const apps = window.AppsManager.getAll();
      apps.then((data) => {
        this.apps = data;
        this.createIcons();
      });
    },

    handleLauncherButtonClick: function (event) {
      this.element.classList.toggle('visible');
    },

    handleLauncherMaximizeButtonClick: function (event) {
      this.element.classList.toggle('maximized');
    },

    splitArray: function (array, chunkSize) {
      let result = [];
      for (let i = 0; i < array.length; i += chunkSize) {
        result.push(array.slice(i, i + chunkSize));
      }
      return result;
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
      const distance = Math.sqrt(
        Math.pow(rectCenterX - centerX, 2) + Math.pow(rectCenterY - centerY, 2)
      );

      // Apply CSS transformations
      element.style.setProperty('--pos-z', `${distance}px`);
    },

    createIcons: function () {
      this.apps = this.apps.filter(
        (obj) => this.HIDDEN_ROLES.indexOf(obj.manifest.role) === -1
      );

      const pages = this.splitArray(
        this.apps,
        this.gridColumns * this.gridRows
      );
      pages.forEach((array, offset) => {
        const rtl = document.dir === 'rtl';

        const page = document.createElement('ul');
        page.id = `page${offset}`;
        page.classList.add('page');
        page.style.transform = rtl
          ? `translateX(-${offset * 100}%)`
          : `translateX(${offset * 100}%)`;
        if (this.DEFAULT_PAGE_INDEX === offset) {
          page.scrollIntoView();
        }
        this.gridElement.appendChild(page);

        const dot = document.createElement('div');
        dot.classList.add('dot');
        this.paginationBar.appendChild(dot);

        let index = 0;
        array.forEach((app) => {
          const icon = document.createElement('li');
          icon.id = `appicon${index}`;
          icon.classList.add('icon');
          page.appendChild(icon);
          this.applyParallaxEffect(icon);

          icon.addEventListener('click', (event) =>
            this.handleAppClick(event, app, iconContainer)
          );
          icon.addEventListener('contextmenu', (event) =>
            this.handleIconContextMenu(event, app, iconContainer)
          );

          const iconHolder = document.createElement('div');
          iconHolder.classList.add('icon-holder');
          icon.appendChild(iconHolder);

          const iconContainer = document.createElement('img');
          iconContainer.draggable = false;
          iconContainer.crossOrigin = 'anonymous';
          Object.entries(app.manifest.icons).forEach((entry) => {
            if (entry[0] <= this.APP_ICON_SIZE) {
              return;
            }
            iconContainer.src = entry[1];
          });
          iconContainer.onerror = () => {
            iconContainer.src = '/images/default.png';
          };
          DirectionalScale.init(iconContainer);
          iconHolder.appendChild(iconContainer);

          const notificationBadge = document.createElement('span');
          notificationBadge.textContent = 0;
          notificationBadge.classList.add('notification-badge');
          iconHolder.appendChild(notificationBadge);

          const uninstallButton = document.createElement('button');
          uninstallButton.dataset.icon = 'remove';
          uninstallButton.classList.add('uninstall-button');
          iconHolder.appendChild(uninstallButton);

          const name = document.createElement('div');
          name.classList.add('name');
          name.textContent = app.manifest.name;
          icon.appendChild(name);

          index++;
        });
      });
    },

    handleSwiping: function () {
      const scrollCenter =
        this.gridElement.scrollLeft + this.gridElement.clientWidth / 2;

      const dots = this.paginationBar.querySelectorAll('.dot');
      const carouselItems = this.gridElement.querySelectorAll('.page');
      dots.forEach((dot, index) => {
        const distance = Math.abs(
          scrollCenter -
            (carouselItems[index].getBoundingClientRect().left +
              this.gridElement.clientWidth / 2)
        );
        const fadeDistance = this.gridElement.clientWidth / 2;

        if (distance < fadeDistance) {
          const progress = 1 - distance / fadeDistance;
          dot.style.setProperty('--pagination-progress', progress);
        } else {
          dot.style.setProperty('--pagination-progress', 0);
        }
      });
    },

    handleAppClick: function (event, app, icon) {
      let langCode;
      try {
        langCode = navigator.mozL10n.language.code || 'en-US';
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

      if (!this.isDragging) {
        // Dispatch the custom event with the manifest URL
        AppWindow.create(manifestUrl);
      }
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
            this.app.dataset.editMode = !this.app.dataset.editMode;
          }
        }
      }, 10);
    },

    onPointerUp: function () {
      this.timePassed = 0;
      this.isHoldingDown = false;
    },

    handleContextMenu: function () {
      this.app.dataset.editMode = !this.app.dataset.editMode;
    },

    handleIconContextMenu: async function (event, app, icon) {
      event.preventDefault();
      event.stopPropagation();

      let langCode;
      try {
        langCode = navigator.mozL10n.language.code || 'en-US';
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
          console.log('Error fetching manifest:', error);
        });

      this.shortcuts.classList.add('visible');

      const iconBox = icon.getBoundingClientRect();

      this.shortcutsFakeIcon.src = icon.src;
      this.shortcutsFakeIcon.style.left = iconBox.left + 'px';
      this.shortcutsFakeIcon.style.top = iconBox.top + 'px';

      this.shortcutsList.innerHTML = '';
      if (manifest && manifest.shortcuts) {
        this.shortcutsList.style.display = 'block';
        manifest.shortcuts.forEach((shortcut) => {
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
        });
      } else {
        this.shortcutsList.style.display = 'none';
      }

      this.shortcutsMenu.style.top = iconBox.top + 60 + 'px';
      if (iconBox.left > window.innerWidth - this.shortcutsMenu.clientWidth) {
        this.shortcutsMenu.style.left =
          iconBox.left - this.shortcutsMenu.clientWidth + 50 + 'px';
      } else {
        this.shortcutsMenu.style.left = iconBox.left + 'px';
      }
    }
  };

  AppLauncher.init();
})(window);
