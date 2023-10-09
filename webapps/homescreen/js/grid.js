!(function (exports) {
  'use strict';

  const Grid = {
    gridColumns: 4,
    gridRows: 6,
    HIDDEN_ROLES: ['homescreen', 'keyboard', 'system', 'theme'],
    APP_ICON_SIZE: 45,

    DEFAULT_DOCK_ICONS: [
      `http://browser.localhost:${location.port}/manifest.json`,
      `http://sms.localhost:${location.port}/manifest.json`,
      `http://contacts.localhost:${location.port}/manifest.json`,
      `http://dialer.localhost:${location.port}/manifest.json`
    ],

    app: document.getElementById('app'),
    gridElement: document.getElementById('grid'),
    dockElement: document.getElementById('dockbar'),
    paginationBar: document.getElementById('paginationBar'),
    paginationBarDots: paginationBar.querySelector('.dots'),
    dropIndicatorElement: document.getElementById('drop-indicator'),
    apps: [],

    timer: null,

    init: function () {
      this.dockElement.style.setProperty('--grid-columns', this.gridColumns);
      this.gridElement.style.setProperty('--grid-columns', this.gridColumns);
      this.gridElement.style.setProperty('--grid-rows', this.gridRows);

      window.addEventListener('ipc-message', this.handleIPCMessage.bind(this));

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
      const pages = this.splitArray(this.apps, 4 * 6);
      console.log(pages);
      pages.forEach((array, offset) => {
        const rtl = document.dir === 'rtl';

        const page = document.createElement('div');
        page.id = `page${offset}`;
        page.classList.add('page');
        page.style.transform = rtl
          ? `translateX(-${offset * 100}%)`
          : `translateX(${offset * 100}%)`;
        this.gridElement.appendChild(page);

        const dot = document.createElement('div');
        dot.classList.add('dot');
        this.paginationBarDots.appendChild(dot);

        let index = 0;
        array.forEach((app) => {
          const icon = document.createElement('div');
          icon.id = `appicon${index}`;
          icon.classList.add('icon');
          const manifestIndex = this.DEFAULT_DOCK_ICONS.indexOf(
            app.manifestUrl['en-US']
          );
          if (manifestIndex !== -1) {
            setTimeout(() => {
              this.dockElement.appendChild(icon);
              this.applyParallaxEffect(icon);
            }, manifestIndex * 10);
          } else {
            page.appendChild(icon);
            this.applyParallaxEffect(icon);
          }
          icon.addEventListener('click', (event) =>
            this.handleAppClick(event, app, iconContainer)
          );

          const iconHolder = document.createElement('div');
          iconHolder.classList.add('icon-holder');
          icon.appendChild(iconHolder);

          const iconContainer = document.createElement('img');
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

      const dots = this.paginationBarDots.querySelectorAll('.dot');
      const carouselItems = this.gridElement.querySelectorAll('.page');
      dots.forEach((dot, index) => {
        const distance = Math.abs(
          scrollCenter -
            (carouselItems[index].getBoundingBoxRect().left +
              carouselItems[index].clientWidth / 2)
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

  Grid.init();
})(window);
