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

    gridElement: document.getElementById('grid'),
    dockElement: document.getElementById('dockbar'),
    paginationBar: document.getElementById('paginationBar'),
    paginationBarDots: paginationBar.querySelector('.dots'),
    dropIndicatorElement: document.getElementById('drop-indicator'),
    apps: [],

    init: function () {
      this.dockElement.style.setProperty('--grid-columns', this.gridColumns);
      this.gridElement.style.setProperty('--grid-columns', this.gridColumns);
      this.gridElement.style.setProperty('--grid-rows', this.gridRows);

      this.gridElement.addEventListener('scroll', this.handleSwiping.bind(this));

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

    createIcons: function () {
      const pages = this.splitArray(
        this.apps,
        4 * 6
      );
      console.log(pages);
      pages.forEach((array, offset) => {
        const page = document.createElement('div');
        page.id = `page${offset}`;
        page.classList.add('page');
        const rtl = document.dir === 'rtl';
        page.style.transform = rtl ? `translateX(-${offset * 100}%)` : `translateX(${offset * 100}%)`;
        this.gridElement.appendChild(page);

        const dot = document.createElement('div');
        dot.classList.add('dot');
        this.paginationBarDots.appendChild(dot);

        let index = 0;
        array.forEach((app) => {
          if (this.HIDDEN_ROLES.indexOf(app.manifest.role) !== -1) {
            return;
          }

          const icon = document.createElement('div');
          icon.id = `appicon${index}`;
          icon.classList.add('icon');
          icon.addEventListener('click', (event) =>
            this.handleAppClick(event, app)
          );
          const manifestIndex = this.DEFAULT_DOCK_ICONS.indexOf(
            app.manifestUrl['en-US']
          );
          if (manifestIndex !== -1) {
            setTimeout(() => {
              this.dockElement.appendChild(icon);
            }, manifestIndex * 10);
          } else {
            page.appendChild(icon);
          }

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
      const paginationDots = this.paginationBarDots.querySelectorAll('.dot');
      paginationDots.forEach((dot, index) => {
        let progress = grid.scrollLeft - (window.innerWidth * index);
        progress = progress / window.innerWidth;
        progress = Math.abs(progress - 0.5);
        dot.style.setProperty('--page-progress', progress);
      })
    },

    handleAppClick: function (event, app) {
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

      if (!Grid.isDragging) {
        // Dispatch the custom event with the manifest URL
        window.IPC.send('message', {
          type: 'launch',
          manifestUrl
          // icon_x: x,
          // icon_y: y,
          // icon_width: width,
          // icon_height: height
        });
      }
    }
  };

  window.addEventListener('load', function () {
    setTimeout(() => {
      Grid.init();
    }, 1000);
  });
})(window);
