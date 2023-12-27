!(function (exports) {
  'use strict';

  const Grid = {
    gridColumns: 4,
    gridRows: 6,
    HIDDEN_ROLES: ['homescreen', 'keyboard', 'system', 'theme', 'addon'],
    APP_ICON_SIZE: 45,

    DEFAULT_DOCK_ICONS: [
      'http://browser.localhost:8081/manifest.json',
      'http://sms.localhost:8081/manifest.json',
      { manifestUrl: 'http://communications.localhost:8081/manifest.json', entryId: 'contacts' },
      { manifestUrl: 'http://communications.localhost:8081/manifest.json', entryId: 'dialer' }
    ],

    app: document.getElementById('app'),
    gridElement: document.getElementById('grid'),
    dockElement: document.getElementById('dockbar'),
    paginationBar: document.getElementById('paginationBar'),
    paginationBarDots: paginationBar.querySelector('.dots'),
    shortcuts: document.getElementById('shortcuts'),
    shortcutsMenu: document.getElementById('shortcuts-menu'),
    shortcutsList: document.getElementById('shortcuts-menu-options'),
    shortcutsFakeIcon: document.getElementById('shortcuts-fake-icon'),
    apps: [],
    dockApps: [],

    isHoldingDown: false,
    timeoutID: null,
    timePassed: 0,

    DEFAULT_PAGE_INDEX: 0,

    init: function () {
      this.dockElement.style.setProperty('--grid-columns', this.gridColumns);
      this.gridElement.style.setProperty('--grid-columns', this.gridColumns);
      this.gridElement.style.setProperty('--grid-rows', this.gridRows);

      document.addEventListener('click', this.onClick.bind(this));
      this.gridElement.addEventListener('pointerdown', this.onPointerDown.bind(this));
      this.gridElement.addEventListener('pointerup', this.onPointerUp.bind(this));
      this.gridElement.addEventListener('contextmenu', this.handleContextMenu.bind(this));
      window.addEventListener('ipc-message', this.handleIPCMessage.bind(this));

      this.gridElement.addEventListener('scroll', this.handleSwiping.bind(this));

      let apps = AppsManager.getAll();
      apps.then((data) => {
        this.apps = data;
        this.createIcons();
        this.handleSwiping();
        this.apps = null;
        apps = null;
      });
    },

    splitArray: function (array, chunkSize) {
      const result = [];
      for (let index = 0; index < array.length; index += chunkSize) {
        result.push(array.slice(index, index + chunkSize));
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
      const distance = Math.sqrt(Math.pow(rectCenterX - centerX, 2) + Math.pow(rectCenterY - centerY, 2));

      // Apply CSS transformations
      element.style.setProperty('--pos-z', `${distance}px`);
    },

    createIcons: function () {
      for (let index = 0, length = this.apps.length; index < length; index++) {
        const obj = this.apps[index];

        if (!(obj.manifest && obj.manifest?.entry_points)) {
          continue;
        }
        const entryPoints = Object.entries(obj.manifest?.entry_points) || [];

        if (!(entryPoints && entryPoints.length > 0)) {
          continue;
        }
        for (let index1 = 0, length1 = entryPoints.length; index1 < length1; index1++) {
          const newObj = {
            entry_id: entryPoints[index1][0],
            manifest: entryPoints[index1][1]
          };
          const baseObj = { ...obj };
          const merge = Object.assign(baseObj, newObj);
          this.apps.push(merge);
          console.log(merge);
        }
      }
      this.apps = this.apps.filter((obj) => this.HIDDEN_ROLES.indexOf(obj.manifest.role) === -1);

      this.dockApps = this.apps.filter((obj) => {
        const match = this.DEFAULT_DOCK_ICONS.some((item) => {
          if (typeof item === 'string') {
            return item === obj.manifestUrl;
          } else if (typeof item === 'object' && item.manifestUrl && item.entryId) {
            return item.manifestUrl === obj.manifestUrl && item.entryId === obj.entryId;
          }
          return false;
        });

        return match;
      });

      this.apps = this.apps.filter((obj) => {
        if (typeof obj.manifestUrl === 'string') {
          return !this.DEFAULT_DOCK_ICONS.some((dockIcon) => dockIcon === obj.manifestUrl);
        }
        return false;
      });
      console.log(this.dockApps, this.apps);

      let index = 0;
      this.dockApps.forEach((app) => {
        this.createAppIcon(this.dockElement, app, index);
        index++;
      });

      const fragment = document.createDocumentFragment();

      const pages = this.splitArray(this.apps, this.gridColumns * this.gridRows);
      pages.forEach((array, offset) => {
        const rtl = document.dir === 'rtl';

        const page = document.createElement('ul');
        page.id = `page${offset}`;
        page.classList.add('page');
        page.style.transform = rtl ? `translateX(-${offset * 100}%)` : `translateX(${offset * 100}%)`;
        if (this.DEFAULT_PAGE_INDEX === offset) {
          page.scrollIntoView();
        }
        fragment.appendChild(page);

        const dot = document.createElement('div');
        dot.classList.add('dot');
        this.paginationBarDots.appendChild(dot);

        array.forEach((app) => {
          this.createAppIcon(page, app, index);
          index++;
        });
      });

      this.gridElement.appendChild(fragment);
    },

    createAppIcon: async function (page, app, index) {
      const icon = document.createElement('li');
      icon.id = `appicon${index}`;
      icon.classList.add('icon');
      page.appendChild(icon);
      this.applyParallaxEffect(icon);
      icon.addEventListener('click', (event) => this.handleAppClick(event, app, iconContainer));
      icon.addEventListener('contextmenu', (event) => this.handleIconContextMenu(event, app, iconContainer));

      const iconHolder = document.createElement('div');
      iconHolder.classList.add('icon-holder');
      icon.appendChild(iconHolder);

      let iconContainer;
      if (app.manifest.homescreen && app.manifest.homescreen.dynamic_icon && app.manifest.homescreen.dynamic_icon.start_url) {
        iconContainer = document.createElement('iframe');
        iconContainer.classList.add('appicon');
        const url = new URL(app.manifestUrl['en-US']);
        iconContainer.src = url.origin + app.manifest.homescreen.dynamic_icon.start_url;
        iconHolder.appendChild(iconContainer);
      } else {
        iconContainer = document.createElement('img');
        iconContainer.classList.add('appicon');
        iconContainer.draggable = false;
        iconContainer.crossOrigin = 'anonymous';
        Object.entries(app.manifest.icons).forEach((entry) => {
          if (entry[0] <= this.APP_ICON_SIZE) {
            return;
          }
          const url = new URL(app.manifestUrl['en-US']);
          iconContainer.src = url.origin + entry[1];
        });
        iconContainer.onerror = () => {
          iconContainer.src = '/images/default.svg';
        };
        iconHolder.appendChild(iconContainer);
      }

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
    },

    handleSwiping: function () {
      const dots = this.paginationBarDots.querySelectorAll('.dot');
      const carouselItems = this.gridElement.querySelectorAll('.page');
      let activeIndex = -1;

      for (let index = 0; index < carouselItems.length; index++) {
        const item = carouselItems[index];
        const pageX = item.getBoundingClientRect().left;
        const progress = Math.max(0, Math.min(1, 1 - pageX / item.offsetWidth));
        dots[index].style.setProperty('--pagination-progress', progress);

        if (progress > 0.5 && activeIndex === -1) {
          activeIndex = index;
        }
      }

      for (let i = 0; i < dots.length; i++) {
        dots[i].style.setProperty('--pagination-progress', i === activeIndex ? 1 : 0);
      }
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

      if (!Grid.isDragging) {
        // Dispatch the custom event with the manifest URL
        IPC.send('message', {
          type: 'launch',
          manifestUrl,
          entryId: app.entry_id,
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

    onClick: function (event) {
      if (event.target === this.shortcuts) {
        this.shortcuts.classList.remove('visible');
      }
    },

    onPointerDown: function () {
      this.isHoldingDown = true;
      this.timeoutID = setInterval(() => {
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

  window.addEventListener('load', () => {
    setTimeout(() => {
      Grid.init();
    }, 500);
  });
})(window);
